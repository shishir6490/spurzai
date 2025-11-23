const mongoose = require('mongoose');

async function removeDuplicateSalary() {
  try {
    await mongoose.connect('mongodb+srv://spurzadmin:bI3GcJjXVx0G1jAr@spurz-cluster.sz4szc0.mongodb.net/spurz-ai?retryWrites=true&w=majority&appName=spurz-cluster');
    
    const IncomeSource = mongoose.model('IncomeSource', new mongoose.Schema({}, { strict: false, collection: 'incomesources' }));
    
    // Find all salary entries
    const salaries = await IncomeSource.find({ 
      name: { $regex: /^Salary$/i },
      isActive: true 
    }).lean();
    
    console.log('Found salary entries:', salaries.length);
    console.log('Salary entries:', JSON.stringify(salaries, null, 2));
    
    if (salaries.length > 1) {
      // Delete all but keep the first one
      const toDelete = salaries.slice(1);
      console.log('\nDeleting', toDelete.length, 'duplicate(s)...');
      
      for (const doc of toDelete) {
        await IncomeSource.deleteOne({ _id: doc._id });
        console.log('✅ Deleted ID:', doc._id);
      }
      
      console.log('\n✅ Duplicates removed successfully!');
      
      // Verify remaining
      const remaining = await IncomeSource.find({ isActive: true }).lean();
      console.log('\n📊 Remaining income sources:');
      remaining.forEach(r => console.log('  -', r.name || r.source, ':', r.amount));
    } else {
      console.log('No duplicates found');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeDuplicateSalary();
