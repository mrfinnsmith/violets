import mixpanel from 'mixpanel-browser';
// import { createClient } from '@supabase/supabase-js';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let mixpanelInitialized = false;
// let supabase: ReturnType<typeof createClient> | null = null;

export const initAnalytics = () => {
  if (typeof window === 'undefined') return;

  if (MIXPANEL_TOKEN && !mixpanelInitialized) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: true,
      persistence: 'localStorage',
    });
    mixpanelInitialized = true;
  }

  // Supabase integration disabled for now
  // if (SUPABASE_URL && SUPABASE_ANON_KEY && !supabase) {
  //   supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // }
};

export const trackChoice = (nodeId: string, choiceText: string, nextNodeId: string) => {
  // Track with Mixpanel
  if (mixpanelInitialized && MIXPANEL_TOKEN) {
    mixpanel.track('choice_made', {
      nodeId,
      choiceText,
      nextNodeId,
      timestamp: Date.now(),
    });
  }
};

export const trackNodeVisit = (nodeId: string) => {
  // Track with Mixpanel
  if (mixpanelInitialized && MIXPANEL_TOKEN) {
    mixpanel.track('node_visited', {
      nodeId,
      timestamp: Date.now(),
    });
  }
};

export const trackGameComplete = (endingNodeId: string, totalChoices: number) => {
  // Track with Mixpanel
  if (mixpanelInitialized && MIXPANEL_TOKEN) {
    mixpanel.track('game_completed', {
      nodeId: endingNodeId,
      total_choices: totalChoices,
      timestamp: Date.now(),
    });
  }
};