-- Create amazon_clicks table to track when users click on Amazon affiliate links
CREATE TABLE IF NOT EXISTS amazon_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product identification
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_asin TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  
  -- Click metadata
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Optional: User tracking (if you implement auth later)
  user_id UUID, -- Could reference auth.users if you add authentication
  session_id TEXT, -- Browser session identifier
  
  -- Optional: Analytics data
  referrer TEXT, -- Where the user came from
  user_agent TEXT, -- Browser/device info
  ip_address INET, -- For geo-analytics (anonymize after processing)
  
  -- Marketplace context
  marketplace_code TEXT NOT NULL,
  
  -- Indexes for performance
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_amazon_clicks_product_id ON amazon_clicks(product_id);
CREATE INDEX idx_amazon_clicks_product_asin ON amazon_clicks(product_asin);
CREATE INDEX idx_amazon_clicks_clicked_at ON amazon_clicks(clicked_at DESC);
CREATE INDEX idx_amazon_clicks_marketplace ON amazon_clicks(marketplace_code);
CREATE INDEX idx_amazon_clicks_session ON amazon_clicks(session_id) WHERE session_id IS NOT NULL;

-- Create composite index for analytics queries
CREATE INDEX idx_amazon_clicks_analytics ON amazon_clicks(product_id, clicked_at DESC);

-- Add RLS policies (allow inserts, restrict reads to admin)
ALTER TABLE amazon_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert click tracking (anonymous tracking)
CREATE POLICY "Allow anonymous click tracking"
  ON amazon_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service role can read/delete (for analytics/cleanup)
CREATE POLICY "Service role can read all clicks"
  ON amazon_clicks
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete old clicks"
  ON amazon_clicks
  FOR DELETE
  TO service_role
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE amazon_clicks IS 'Tracks when users click on Amazon affiliate links for analytics';
COMMENT ON COLUMN amazon_clicks.product_asin IS 'Amazon ASIN for the product';
COMMENT ON COLUMN amazon_clicks.session_id IS 'Browser session identifier for tracking user journey';
COMMENT ON COLUMN amazon_clicks.ip_address IS 'IP address for geo-analytics (should be anonymized after processing)';
