import React, { useState, useEffect } from 'react';
import { postService } from '../../services/postService';
import { PostDto } from '../../types/post.types';

interface PostAnalyticsProps {
  postId: string;
}

interface PostPerformanceDto {
  views: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgTimeOnPage: number;
  organicTraffic: number;
  viewsGrowth: number;
  uniqueVisitorsGrowth: number;
  avgTimeOnPageGrowth: number;
  organicTrafficGrowth: number;
}

interface AnalyticsData {
  post: PostDto;
  performance: PostPerformanceDto;
  seoInsights: {
    score: number;
    recommendations: string[];
    keywordDensity: Record<string, number>;
    readabilityScore: number;
  };
  competitorAnalysis?: {
    similarPosts: Array<{
      id: string;
      title: string;
      seoScore: number;
      performance: PostPerformanceDto;
    }>;
    averageMetrics: PostPerformanceDto;
  };
}

const PostAnalytics: React.FC<PostAnalyticsProps> = ({ postId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [postId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch post details
      const postResponse = await postService.getPost(postId);
      const post = postResponse.data;
      
      // Mock performance data since API doesn't exist yet
      const performance: PostPerformanceDto = {
        views: Math.floor(Math.random() * 10000) + 1000,
        uniqueVisitors: Math.floor(Math.random() * 5000) + 500,
        bounceRate: Math.floor(Math.random() * 50) + 25,
        avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
        organicTraffic: Math.floor(Math.random() * 3000) + 200,
        viewsGrowth: Math.floor(Math.random() * 20) + 5,
        uniqueVisitorsGrowth: Math.floor(Math.random() * 15) + 3,
        avgTimeOnPageGrowth: Math.floor(Math.random() * 10) + 2,
        organicTrafficGrowth: Math.floor(Math.random() * 25) + 8
      };
      
      // Mock SEO insights
      const seoInsights = {
        score: calculateSEOScore(post),
        recommendations: generateSEORecommendations(post),
        keywordDensity: analyzeKeywordDensity(post.body || ''),
        readabilityScore: calculateReadabilityScore(post.body || '')
      };

      setAnalytics({
        post,
        performance,
        seoInsights
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateSEOScore = (post: PostDto): number => {
    let score = 0;
    const maxScore = 100;

    // Title optimization (20 points)
    if (post.title && post.title.length >= 30 && post.title.length <= 60) score += 20;
    else if (post.title && post.title.length > 0) score += 10;

    // Meta description (20 points)
    if (post.seoMeta?.description && 
        post.seoMeta.description.length >= 120 && 
        post.seoMeta.description.length <= 160) score += 20;
    else if (post.seoMeta?.description) score += 10;

    // Slug optimization (10 points)
    if (post.slug && post.slug.length <= 50 && !post.slug.includes('_')) score += 10;

    // Content length (20 points)
    const wordCount = post.body ? post.body.split(/\s+/).length : 0;
    if (wordCount >= 300) score += 20;
    else if (wordCount >= 150) score += 10;

    // Focus keyword (15 points)
    if (post.seoMeta?.keywords && post.seoMeta.keywords.length > 0) {
      const keyword = post.seoMeta.keywords[0].toLowerCase();
      const titleHasKeyword = post.title?.toLowerCase().includes(keyword);
      const bodyHasKeyword = post.body?.toLowerCase().includes(keyword);
      
      if (titleHasKeyword && bodyHasKeyword) score += 15;
      else if (titleHasKeyword || bodyHasKeyword) score += 8;
    }

    // Image alt text (10 points)
    const hasImages = post.body?.includes('<img') || post.featuredImage;
    if (hasImages) score += 5; // Assume some alt text exists

    // Internal/external links (5 points)
    const hasLinks = post.body?.includes('<a href');
    if (hasLinks) score += 5;

    return Math.round((score / maxScore) * 100);
  };

  const generateSEORecommendations = (post: PostDto): string[] => {
    const recommendations: string[] = [];

    // Title recommendations
    if (!post.title || post.title.length < 30) {
      recommendations.push('Consider making your title longer (30-60 characters) for better SEO');
    }
    if (post.title && post.title.length > 60) {
      recommendations.push('Your title might be too long. Keep it under 60 characters');
    }

    // Meta description recommendations
    if (!post.seoMeta?.description) {
      recommendations.push('Add a meta description to improve click-through rates');
    } else if (post.seoMeta.description.length < 120) {
      recommendations.push('Consider expanding your meta description (120-160 characters)');
    }

    // Content recommendations
    const wordCount = post.body ? post.body.split(/\s+/).length : 0;
    if (wordCount < 300) {
      recommendations.push('Consider adding more content. Posts with 300+ words tend to rank better');
    }

    // Focus keyword recommendations
    if (!post.seoMeta?.keywords || post.seoMeta.keywords.length === 0) {
      recommendations.push('Add focus keywords to optimize your content around');
    }

    // Image recommendations
    if (!post.featuredImage) {
      recommendations.push('Add a featured image to improve social sharing and engagement');
    }

    return recommendations;
  };

  const analyzeKeywordDensity = (content: string): Record<string, number> => {
    // Simple keyword density analysis
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount = words.length;
    const frequency: Record<string, number> = {};

    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const density: Record<string, number> = {};
    Object.entries(frequency)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .forEach(([word, count]) => {
        density[word] = Math.round((count / wordCount) * 100 * 100) / 100;
      });

    return density;
  };

  const calculateReadabilityScore = (content: string): number => {
    // Simplified Flesch Reading Ease Score
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    const syllables = content.split(/[aeiouAEIOU]/).length - 1;

    if (words === 0 || sentences === 0) return 0;

    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return num.toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">{error || 'Failed to load analytics'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Post Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {analytics.post.title}
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatNumber(analytics.performance.views)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            +{formatPercentage(analytics.performance.viewsGrowth)} vs prev period
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatNumber(analytics.performance.uniqueVisitors)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Unique Visitors</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            +{formatPercentage(analytics.performance.uniqueVisitorsGrowth)} vs prev period
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatPercentage(analytics.performance.bounceRate)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Bounce Rate</div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
            {analytics.performance.bounceRate > 70 ? 'High' : analytics.performance.bounceRate < 40 ? 'Low' : 'Average'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {analytics.performance.avgTimeOnPage}s
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Time on Page</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            +{formatPercentage(analytics.performance.avgTimeOnPageGrowth)} vs prev period
          </div>
        </div>
      </div>

      {/* SEO Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          SEO Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SEO Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${
              analytics.seoInsights.score >= 80 ? 'text-green-600 dark:text-green-400' :
              analytics.seoInsights.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {analytics.seoInsights.score}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">SEO Score</div>
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2`}>
              <div
                className={`h-2 rounded-full ${
                  analytics.seoInsights.score >= 80 ? 'bg-green-600' :
                  analytics.seoInsights.score >= 60 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${analytics.seoInsights.score}%` }}
              ></div>
            </div>
          </div>

          {/* Readability Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${
              analytics.seoInsights.readabilityScore >= 80 ? 'text-green-600 dark:text-green-400' :
              analytics.seoInsights.readabilityScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {analytics.seoInsights.readabilityScore}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Readability</div>
            <div className="text-xs text-gray-400 mt-1">
              {analytics.seoInsights.readabilityScore >= 90 ? 'Very Easy' :
               analytics.seoInsights.readabilityScore >= 80 ? 'Easy' :
               analytics.seoInsights.readabilityScore >= 70 ? 'Fairly Easy' :
               analytics.seoInsights.readabilityScore >= 60 ? 'Standard' :
               analytics.seoInsights.readabilityScore >= 50 ? 'Fairly Difficult' :
               analytics.seoInsights.readabilityScore >= 30 ? 'Difficult' : 'Very Difficult'}
            </div>
          </div>

          {/* Organic Traffic */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {formatNumber(analytics.performance.organicTraffic)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Organic Traffic</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              +{formatPercentage(analytics.performance.organicTrafficGrowth)} vs prev period
            </div>
          </div>
        </div>
      </div>

      {/* SEO Recommendations */}
      {analytics.seoInsights.recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            SEO Recommendations
          </h3>
          <div className="space-y-3">
            {analytics.seoInsights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-5 h-5 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  !
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyword Density */}
      {Object.keys(analytics.seoInsights.keywordDensity).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Keywords
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(analytics.seoInsights.keywordDensity).map(([keyword, density]) => (
              <div key={keyword} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {keyword}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {density}% density
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostAnalytics;
