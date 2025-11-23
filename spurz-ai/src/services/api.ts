/**
 * API Client Service
 * Handles all communication with the Spurz.ai backend
 */

import { Platform } from 'react-native';

// Get the correct API URL based on platform
const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://api.spurz.ai'; // Production URL
  }
  
  // Development URLs
  // For physical devices, use your Mac's IP address
  // Both Mac and phone must be on same network (WiFi or Personal Hotspot)
  const MAC_IP = '192.168.1.13'; // Update this if your IP changes
  
  if (Platform.OS === 'android') {
    // Android emulator uses special IP
    return 'http://10.0.2.2:4000';
  }
  
  // iOS - physical device or simulator
  // Note: Change to 'localhost' if using iOS Simulator
  return `http://${MAC_IP}:4000`;
};

const API_BASE_URL = getApiBaseUrl();

console.log(`🌐 API Base URL: ${API_BASE_URL}`);
console.log(`📱 Platform: ${Platform.OS}`);
console.log(`🔧 Dev Mode: ${__DEV__}`);

interface ApiError {
  error: string;
  message: string;
}

class ApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge existing headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers[key] = String(value);
      });
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ API Error ${response.status}:`, data);
        throw new Error((data as ApiError).message || 'API request failed');
      }

      console.log(`✅ API Success: ${endpoint}`);
      return data as T;
    } catch (error: any) {
      console.error('❌ API Error:', error.message || error);
      console.error('URL:', url);
      throw error;
    }
  }

  // ==================== Auth ====================
  
  async exchangeFirebaseToken(firebaseToken: string, firebaseUser: any) {
    // In development, use the dev endpoint that doesn't require token verification
    if (__DEV__) {
      const payload = {
        phoneNumber: firebaseUser.displayName || firebaseUser.phoneNumber,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
      };
      console.log('📤 Sending to backend:', payload);
      
      return this.request<{ user: any; profile: any }>('/auth/dev/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    
    // In production, use the standard Firebase token exchange
    return this.request<{ user: any; profile: any }>('/auth/exchange', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
      },
    });
  }

  // ==================== Profile ====================
  
  async getProfile() {
    return this.request<any>('/profile');
  }

  async updateProfile(data: {
    fullName?: string;
    dateOfBirth?: Date | string;
    occupation?: string;
    city?: string;
    preferences?: any;
  }) {
    // Convert Date to ISO string if needed
    const payload = {
      ...data,
      dateOfBirth: data.dateOfBirth instanceof Date 
        ? data.dateOfBirth.toISOString() 
        : data.dateOfBirth,
    };
    
    return this.request<any>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async updateOnboardingStep(step: number, completed?: boolean) {
    return this.request<any>('/profile/onboarding', {
      method: 'POST',
      body: JSON.stringify({ 
        step,
        completed: completed || (step >= 3), // Auto-complete when reaching final step
      }),
    });
  }

  // ==================== Income ====================
  
  async getIncomeSources() {
    return this.request<any>('/income');
  }

  async addIncomeSource(data: {
    source?: string;
    name?: string;
    type?: string;
    amount: number;
    frequency: string;
    isPrimary?: boolean;
  }) {
    return this.request<any>('/income', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIncomeSource(id: string, data: {
    source?: string;
    amount?: number;
    frequency?: string;
    isPrimary?: boolean;
  }) {
    return this.request<any>(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIncomeSource(id: string) {
    return this.request<any>(`/income/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Credit Cards ====================
  
  async getCreditCards() {
    return this.request<any>('/cards');
  }

  async getCreditCard(id: string) {
    return this.request<any>(`/cards/${id}`);
  }

  async addCreditCard(data: {
    bankName: string;
    cardName: string;
    last4Digits: string;
    network: string;
    creditLimit: number;
    currentBalance: number;
    billingCycleDay: number;
    annualFee?: number;
    rewardType?: string;
    rewardRate?: number;
  }) {
    return this.request<any>('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCreditCard(id: string, data: any) {
    return this.request<any>(`/cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCreditCard(id: string) {
    return this.request<any>(`/cards/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Home Dashboard ====================
  
  async getHomeDashboard() {
    return this.request<any>('/home');
  }

  async refreshHomeDashboard() {
    return this.request<any>('/home/refresh', {
      method: 'POST',
    });
  }

  // ==================== Deals ====================
  
  async getDeals(params?: {
    category?: string;
    city?: string;
    isFeatured?: boolean;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<any>(`/deals${queryString ? `?${queryString}` : ''}`);
  }

  async getDeal(id: string) {
    return this.request<any>(`/deals/${id}`);
  }

  async getBestCardForDeal(dealId: string) {
    return this.request<any>(`/deals/${dealId}/best-card`);
  }

  async trackDealClick(dealId: string) {
    return this.request<any>(`/deals/${dealId}/click`, {
      method: 'POST',
    });
  }

  async trackDealRedemption(dealId: string) {
    return this.request<any>(`/deals/${dealId}/redeem`, {
      method: 'POST',
    });
  }

  // ==================== Recommendations ====================
  
  async getCardRecommendations(params?: {
    type?: string;
    includeViewed?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<any>(`/recommendations/cards${queryString ? `?${queryString}` : ''}`);
  }

  async getCardRecommendation(id: string) {
    return this.request<any>(`/recommendations/cards/${id}`);
  }

  async dismissRecommendation(id: string, reason: string) {
    return this.request<any>(`/recommendations/cards/${id}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async applyForRecommendation(id: string) {
    return this.request<any>(`/recommendations/cards/${id}/apply`, {
      method: 'POST',
    });
  }

  async refreshRecommendations() {
    return this.request<any>('/recommendations/cards/refresh', {
      method: 'POST',
    });
  }

  // ==================== Categories ====================
  
  async getCategories() {
    return this.request<any>('/categories');
  }

  // ==================== Market Cards ====================
  
  async getMarketCards(params?: {
    category?: string;
    bank?: string;
    tier?: string;
    network?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<any>(`/market-cards${queryString ? `?${queryString}` : ''}`);
  }

  async getMarketCard(id: string) {
    return this.request<any>(`/market-cards/${id}`);
  }

  async compareMarketCards(cardIds: string[]) {
    return this.request<any>('/market-cards/compare', {
      method: 'POST',
      body: JSON.stringify({ cardIds }),
    });
  }
}

export default new ApiClient();
