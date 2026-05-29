const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.development
dotenv.config({ path: path.resolve(__dirname, '.env.development') });

async function testConnection() {
  console.log('🔄 Attempting to connect to Elasticsearch...');
  console.log(`📍 Node URL: ${process.env.ES_NODE}`);
  console.log(`👤 Username: ${process.env.ES_USERNAME}\n`);

  // Initialize the client with correctly nested auth parameters
  const client = new Client({
    node: process.env.ES_NODE || 'http://localhost:9200',
    auth: {
      username: process.env.ES_USERNAME || 'elastic',
      password: process.env.ES_PASSWORD,
    },
    tls: {
      // Safely handle local HTTP validation checks
      rejectUnauthorized: process.env.ES_TLS_REJECT_UNAUTHORIZED !== 'false'
    }
  });

  try {
    // 1. Test basic cluster connectivity and auth
    const health = await client.cluster.health({});
    console.log('✅ Connection Successful!');
    console.log(`📊 Cluster Status: ${health.status}`);
    console.log(`📦 Number of Data Nodes: ${health.number_of_data_nodes}`);

    console.log('\n🔍 Checking indices...');
    // 2. Safely check if your target index exists
    const targetIndex = 'library_books';
    const indexExists = await client.indices.exists({ index: targetIndex });
    
    if (indexExists) {
      console.log(`📚 Index "${targetIndex}" exists and is accessible.`);
    } else {
      console.log(`ℹ️ Index "${targetIndex}" does not exist yet (your backend app will create it).`);
    }

  } catch (error) {
    console.error('\n❌ Connection Failed!');
    if (error.name === 'ResponseError') {
      console.error(`🛑 HTTP Status Code: ${error.meta.statusCode}`);
      console.error(`📝 Error Details: ${JSON.stringify(error.meta.body || error.message)}`);
      
      if (error.meta.statusCode === 401) {
        console.error('\n💡 Tip: Your username or password in .env.development is invalid.');
      }
    } else {
      console.error('💥 Network/System Error:', error.message);
    }
  }
}

testConnection();