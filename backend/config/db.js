const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Test connection with retry mechanism
const connectDB = async (retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempting to connect to Supabase (Attempt ${attempt}/${retries})...`);

      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = table doesn't exist (ok for first time)
        throw error;
      }

      console.log('✅ Supabase Connected Successfully');
      console.log(`   URL: ${process.env.SUPABASE_URL}`);
      return true;

    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed: ${error.message}`);

      if (attempt < retries) {
        console.log(`   Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // After all retries failed, decide based on environment
        if (process.env.NODE_ENV === 'development') {
          console.error('\n⚠️  WARNING: Supabase Connection Failed After All Retries');
          console.error('   Error:', error.message);
          console.error('\n💡 Server will start in DEGRADED MODE for development');
          console.error('   - API endpoints will return errors');
          console.error('   - Fix the connection to restore functionality');
          console.error('\n🔧 Troubleshooting:');
          console.error('   1. Check your internet connection');
          console.error('   2. Verify credentials at: https://app.supabase.com');
          console.error('   3. Ensure Supabase project is active');
          console.error('   4. Run: node test-supabase.js for detailed diagnostics');
          console.error('   5. Check if you\'re behind a proxy/firewall\n');
          return false; // Allow server to start in degraded mode
        } else {
          // In production, we must have a working database
          console.error('\n❌ Supabase Connection Failed - Cannot Start Server');
          console.error('   Error:', error.message);
          process.exit(1);
        }
      }
    }
  }
};

module.exports = { connectDB, supabase };
