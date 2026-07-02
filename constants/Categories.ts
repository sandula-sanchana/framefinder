export const CATEGORIES = [
  'Beach',
  'Mountain',
  'Waterfall',
  'Forest',
  'Wildlife',
  'Architecture',
  'Street',
  'City',
  'Sunrise',
  'Sunset',
  'Lake',
  'River',
  'Temple',
  'Camping',
  'Night',
] as const;

export type Category = (typeof CATEGORIES)[number];

// Map each category to a Feather icon name from @expo/vector-icons
export const CATEGORY_ICONS: Record<string, string> = {
  Beach: 'umbrella',
  Mountain: 'triangle',
  Waterfall: 'droplet',
  Forest: 'feather',
  Wildlife: 'aperture',
  Architecture: 'home',
  Street: 'map',
  City: 'grid',
  Sunrise: 'sunrise',
  Sunset: 'sunset',
  Lake: 'droplet',
  River: 'droplet',
  Temple: 'home',
  Camping: 'tent',
  Night: 'moon',
};

export const CATEGORY_COLORS: Record<string, string> = {
  Beach: '#4ECDC4',
  Mountain: '#A8DADC',
  Waterfall: '#457B9D',
  Forest: '#2D6A4F',
  Wildlife: '#E9C46A',
  Architecture: '#F4A261',
  Street: '#A0A0A0',
  City: '#9B72CF',
  Sunrise: '#FFB830',
  Sunset: '#FF6B35',
  Lake: '#4ECDC4',
  River: '#457B9D',
  Temple: '#F4A261',
  Camping: '#2D6A4F',
  Night: '#9B72CF',
};
