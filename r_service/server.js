const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NCSKIT R Analytics (Mock)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Topic modeling endpoint
app.post('/analyze/topics', (req, res) => {
  const { abstracts, num_topics = 5 } = req.body;
  
  if (!abstracts || abstracts.length === 0) {
    return res.status(400).json({ error: 'No abstracts provided' });
  }

  // Mock topic modeling results
  const mockTopics = [];
  for (let i = 1; i <= num_topics; i++) {
    mockTopics.push({
      terms: [
        `topic${i}_term1`,
        `topic${i}_term2`,
        `topic${i}_term3`,
        `research`,
        `analysis`,
        `method`,
        `data`,
        `study`,
        `results`,
        `conclusion`
      ]
    });
  }

  res.json({
    topics: mockTopics,
    document_topic_probabilities: abstracts.map(() => 
      Array(num_topics).fill(0).map(() => Math.random())
    ),
    num_documents: abstracts.length,
    num_topics: num_topics,
    perplexity: Math.random() * 100 + 50
  });
});

// Statistical analysis endpoint
app.post('/analyze/statistics', (req, res) => {
  const { data } = req.body;
  
  if (!data) {
    return res.status(400).json({ error: 'No data provided' });
  }

  const stats = {};
  
  // Mock statistical analysis
  Object.keys(data).forEach(key => {
    const values = data[key].filter(v => typeof v === 'number');
    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      
      stats[key] = {
        mean: mean,
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
        sd: Math.sqrt(variance),
        min: Math.min(...values),
        max: Math.max(...values),
        q25: values[Math.floor(values.length * 0.25)],
        q75: values[Math.floor(values.length * 0.75)],
        count: values.length
      };
    }
  });

  res.json(stats);
});

// Trend analysis endpoint
app.post('/analyze/trends', (req, res) => {
  const { publications } = req.body;
  
  if (!publications || publications.length === 0) {
    return res.status(400).json({ error: 'No publications provided' });
  }

  // Group by year and calculate mock trends
  const yearlyStats = {};
  publications.forEach(pub => {
    const year = pub.year;
    if (!yearlyStats[year]) {
      yearlyStats[year] = { count: 0, total_citations: 0 };
    }
    yearlyStats[year].count++;
    yearlyStats[year].total_citations += pub.citations || 0;
  });

  const years = Object.keys(yearlyStats).sort();
  const counts = years.map(year => yearlyStats[year].count);
  
  // Mock linear trend calculation
  const n = years.length;
  const sumX = years.reduce((a, b) => a + parseInt(b), 0);
  const sumY = counts.reduce((a, b) => a + b, 0);
  const slope = n > 1 ? (sumY - (sumX * sumY / n)) / (sumX - (sumX * sumX / n)) : 0;

  res.json({
    yearly_data: Object.keys(yearlyStats).map(year => ({
      year: parseInt(year),
      count: yearlyStats[year].count,
      avg_citations: yearlyStats[year].total_citations / yearlyStats[year].count,
      total_citations: yearlyStats[year].total_citations
    })),
    publication_trend: {
      slope: slope,
      r_squared: Math.random() * 0.5 + 0.5,
      p_value: Math.random() * 0.05
    }
  });
});

// Network analysis endpoint
app.post('/analyze/network', (req, res) => {
  const { collaborations } = req.body;
  
  if (!collaborations || collaborations.length === 0) {
    return res.status(400).json({ error: 'No collaborations provided' });
  }

  const authors = new Set();
  collaborations.forEach(collab => {
    authors.add(collab.author1);
    authors.add(collab.author2);
  });

  const authorCounts = {};
  collaborations.forEach(collab => {
    authorCounts[collab.author1] = (authorCounts[collab.author1] || 0) + 1;
    authorCounts[collab.author2] = (authorCounts[collab.author2] || 0) + 1;
  });

  const topCollaborators = Object.entries(authorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .reduce((obj, [author, count]) => {
      obj[author] = count;
      return obj;
    }, {});

  res.json({
    total_authors: authors.size,
    total_collaborations: collaborations.length,
    unique_pairs: collaborations.length,
    density: (2 * collaborations.length) / (authors.size * (authors.size - 1)),
    top_collaborators: topCollaborators
  });
});

// Clustering analysis endpoint
app.post('/analyze/clustering', (req, res) => {
  const { keywords, num_clusters = 3 } = req.body;
  
  if (!keywords || keywords.length === 0) {
    return res.status(400).json({ error: 'No keywords provided' });
  }

  if (keywords.length < num_clusters) {
    return res.status(400).json({ error: 'Not enough papers for clustering' });
  }

  // Mock clustering results
  const clusterAnalysis = {};
  const papersPerCluster = Math.ceil(keywords.length / num_clusters);
  
  for (let i = 1; i <= num_clusters; i++) {
    const startIdx = (i - 1) * papersPerCluster;
    const endIdx = Math.min(i * papersPerCluster, keywords.length);
    const clusterPapers = Array.from({length: endIdx - startIdx}, (_, idx) => startIdx + idx);
    
    clusterAnalysis[`cluster_${i}`] = {
      size: clusterPapers.length,
      papers: clusterPapers,
      top_keywords: [`cluster${i}_keyword1`, `cluster${i}_keyword2`, `research`, `analysis`],
      keyword_scores: {
        [`cluster${i}_keyword1`]: Math.random(),
        [`cluster${i}_keyword2`]: Math.random(),
        'research': Math.random(),
        'analysis': Math.random()
      }
    };
  }

  res.json({
    clusters: clusterAnalysis,
    total_papers: keywords.length,
    num_clusters: num_clusters,
    within_ss: Math.random() * 100,
    between_ss: Math.random() * 50
  });
});

// Paper recommendations endpoint
app.post('/recommend/papers', (req, res) => {
  const { user_profile, available_papers } = req.body;
  
  if (!user_profile || !user_profile.research_domains) {
    return res.status(400).json({ error: 'No research domains specified' });
  }

  if (!available_papers || available_papers.length === 0) {
    return res.status(400).json({ error: 'No papers available' });
  }

  // Mock recommendation scoring
  const recommendations = available_papers
    .map(paper => ({
      ...paper,
      relevance_score: Math.random()
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 10);

  res.json({
    recommendations: recommendations,
    total_papers: available_papers.length,
    user_domains: user_profile.research_domains
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Starting NCSKIT R Analytics Service (Mock)...');
  console.log('📊 Available endpoints:');
  console.log('   GET  /health - Health check');
  console.log('   POST /analyze/topics - Topic modeling');
  console.log('   POST /analyze/statistics - Statistical analysis');
  console.log('   POST /analyze/trends - Research trend analysis');
  console.log('   POST /analyze/network - Collaboration network analysis');
  console.log('   POST /analyze/clustering - Research domain clustering');
  console.log('   POST /recommend/papers - Paper recommendations');
  console.log('');
  console.log(`🌐 Service running on: http://localhost:${PORT}`);
  console.log('📖 This is a mock implementation for demo purposes');
});