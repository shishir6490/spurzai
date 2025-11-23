import { Router, Response } from 'express';
import { Types } from 'mongoose';
import IncomeSource from '../models/IncomeSource';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/categories - Get aggregated spending by category
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Aggregate expenses by name (which acts as category)
    // Use the same logic as home endpoint - filter by name starting with "Expense:" or containing loan/emi keywords
    const categories = await IncomeSource.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          isActive: true,
          // Match names that start with "Expense:" OR contain loan/emi keywords
          $or: [
            { name: { $regex: '^Expense:', $options: 'i' } },
            { name: { $regex: 'loan|emi', $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: '$name', // Group by expense name (Transportation, Education, etc.)
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 } // Sort by highest spending
      }
    ]);

    console.log('📊 Categories aggregation result:', JSON.stringify(categories, null, 2));

    // Calculate total expenses for percentage calculation
    const totalExpenses = categories.reduce((sum, cat) => sum + cat.totalAmount, 0);

    // Smart icon mapping function based on keywords
    const getIconForCategory = (name: string): string => {
      const lowerName = name.toLowerCase();
      
      // Transportation related
      if (lowerName.includes('transport') || lowerName.includes('car') || lowerName.includes('vehicle') || 
          lowerName.includes('bike') || lowerName.includes('uber') || lowerName.includes('taxi')) {
        return 'car';
      }
      
      // Education related
      if (lowerName.includes('education') || lowerName.includes('school') || lowerName.includes('college') || 
          lowerName.includes('tuition') || lowerName.includes('course')) {
        return 'school';
      }
      
      // Utilities & Bills
      if (lowerName.includes('utilit') || lowerName.includes('bill') || lowerName.includes('electric') || 
          lowerName.includes('water') || lowerName.includes('gas') || lowerName.includes('internet') ||
          lowerName.includes('phone') || lowerName.includes('mobile')) {
        return 'bulb';
      }
      
      // Food & Dining
      if (lowerName.includes('food') || lowerName.includes('dining') || lowerName.includes('restaurant') || 
          lowerName.includes('groceries') || lowerName.includes('grocery')) {
        return 'restaurant';
      }
      
      // Entertainment
      if (lowerName.includes('entertainment') || lowerName.includes('movie') || lowerName.includes('gaming') || 
          lowerName.includes('game')) {
        return 'game-controller';
      }
      
      // Shopping
      if (lowerName.includes('shopping') || lowerName.includes('clothes') || lowerName.includes('fashion')) {
        return 'cart';
      }
      
      // Healthcare
      if (lowerName.includes('health') || lowerName.includes('medical') || lowerName.includes('doctor') || 
          lowerName.includes('medicine') || lowerName.includes('hospital')) {
        return 'medical';
      }
      
      // Housing/Rent
      if (lowerName.includes('rent') || lowerName.includes('housing') || lowerName.includes('house')) {
        return 'home';
      }
      
      // Insurance
      if (lowerName.includes('insurance')) {
        return 'shield-checkmark';
      }
      
      // Travel
      if (lowerName.includes('travel') || lowerName.includes('flight') || lowerName.includes('hotel') || 
          lowerName.includes('vacation')) {
        return 'airplane';
      }
      
      // Subscriptions
      if (lowerName.includes('subscription') || lowerName.includes('netflix') || lowerName.includes('spotify') || 
          lowerName.includes('amazon prime')) {
        return 'repeat';
      }
      
      // Loans (EMI)
      if (lowerName.includes('loan') || lowerName.includes('emi')) {
        if (lowerName.includes('car') || lowerName.includes('vehicle')) {
          return 'car-sport';
        } else if (lowerName.includes('home') || lowerName.includes('house')) {
          return 'home';
        }
        return 'cash';
      }
      
      // Gifts
      if (lowerName.includes('gift') || lowerName.includes('donation')) {
        return 'gift';
      }
      
      // Personal care
      if (lowerName.includes('personal') || lowerName.includes('salon') || lowerName.includes('spa')) {
        return 'cut';
      }
      
      // Default
      return 'wallet';
    };

    // Smart color mapping based on keywords
    const getColorForCategory = (name: string): string => {
      const lowerName = name.toLowerCase();
      
      if (lowerName.includes('transport') || lowerName.includes('car')) return '#3B82F6'; // Blue
      if (lowerName.includes('education') || lowerName.includes('school')) return '#8B5CF6'; // Purple
      if (lowerName.includes('utilit') || lowerName.includes('bill')) return '#EAB308'; // Yellow
      if (lowerName.includes('food') || lowerName.includes('dining')) return '#EF4444'; // Red
      if (lowerName.includes('entertainment')) return '#EC4899'; // Pink
      if (lowerName.includes('shopping')) return '#10B981'; // Green
      if (lowerName.includes('health') || lowerName.includes('medical')) return '#F59E0B'; // Orange
      if (lowerName.includes('rent') || lowerName.includes('housing')) return '#6366F1'; // Indigo
      if (lowerName.includes('insurance')) return '#14B8A6'; // Teal
      if (lowerName.includes('travel')) return '#06B6D4'; // Cyan
      if (lowerName.includes('subscription')) return '#F97316'; // Deep Orange
      if (lowerName.includes('loan') || lowerName.includes('emi')) return '#DC2626'; // Dark Red
      if (lowerName.includes('gift')) return '#D946EF'; // Magenta
      
      // Default colors based on hash of category name
      const colors = ['#3B82F6', '#8B5CF6', '#EAB308', '#10B981', '#F59E0B', '#EC4899', '#14B8A6'];
      const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    // Format categories with metadata
    const formattedCategories = categories.map(cat => {
      const rawName = cat._id;
      // Remove "Expense: " prefix if present
      const name = rawName.replace(/^Expense:\s*/i, '');
      const percentage = totalExpenses > 0 ? (cat.totalAmount / totalExpenses) * 100 : 0;
      
      // Calculate potential savings (5-15% based on category spending)
      const savingPercentage = Math.min(15, Math.max(5, percentage * 0.3));
      const savingPotential = (cat.totalAmount * savingPercentage) / 100;

      // Get dynamic icon and color based on category name
      const icon = getIconForCategory(name);
      const color = getColorForCategory(name);

      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        category: name, // Use 'category' to match frontend component prop
        icon: icon,
        amount: cat.totalAmount,
        percentage: Math.round(percentage * 10) / 10,
        savingPotential: Math.round(savingPotential),
        savingPercentage: Math.round(savingPercentage * 10) / 10,
        color: color,
        bgColor: color,
        barColor: color, // Add barColor alias for color
        count: cat.count
      };
    });

    res.json({
      success: true,
      categories: formattedCategories,
      totalExpenses: totalExpenses,
      categoryCount: formattedCategories.length
    });
    return;

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

export default router;
