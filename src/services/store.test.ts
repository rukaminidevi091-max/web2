import test from 'node:test';
import assert from 'node:assert/strict';
import { store } from './store';

test('store initializes with clean empty products and seeded categories', () => {
  const products = store.getProducts();
  assert.ok(Array.isArray(products));

  const categories = store.getCategories();
  assert.ok(Array.isArray(categories));
  assert.ok(categories.length > 0, 'Should have clean categories');
});

test('store saves product and increments click count for affiliate links', () => {
  const newProd = store.saveProduct({
    name: 'Unit Test Audio Interface',
    slug: 'unit-test-audio-interface',
    brand: 'TestLab',
    price_minor: 1290000,
    click_count: 0
  });

  assert.ok(newProd.id > 0);
  assert.equal(newProd.name, 'Unit Test Audio Interface');

  const initialClicks = newProd.click_count || 0;
  store.incrementClick(newProd.slug);

  const updated = store.getProductBySlug(newProd.slug);
  assert.equal(updated?.click_count, initialClicks + 1);
});

test('store manages wishlist items correctly', () => {
  const testSlug = 'unit-test-wishlist-slug';

  if (store.isInWishlist(testSlug)) {
    store.toggleWishlist(testSlug);
  }
  assert.equal(store.isInWishlist(testSlug), false);

  // Toggle on
  store.toggleWishlist(testSlug);
  assert.equal(store.isInWishlist(testSlug), true);
  assert.ok(store.getWishlist().includes(testSlug));

  // Toggle off
  store.toggleWishlist(testSlug);
  assert.equal(store.isInWishlist(testSlug), false);
});

test('store creates contact inquiries with unique ids', () => {
  const msg = store.addContact({
    category: 'sponsorship',
    name: 'Test Reviewer',
    email: 'test@example.com',
    subject: 'Review Unit Offer',
    message: 'Testing inquiry submission flow.',
    company: 'Test Labs'
  });

  assert.ok(msg.id > 0);
  assert.equal(msg.name, 'Test Reviewer');
  assert.equal(msg.status, 'new');
});

test('store saves product with uploaded images and currency without demo images', () => {
  const prod = store.saveProduct({
    name: 'Custom Microphone',
    brand: 'StudioSound',
    currency: 'USD',
    price_minor: 19900,
    images: [{ url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', alt_text: 'Mic Photo' }]
  });

  assert.ok(prod.id > 0);
  assert.equal(prod.currency, 'USD');
  assert.equal(prod.images.length, 1);
  assert.ok(prod.images[0].url.startsWith('data:image/png'));
  assert.ok(!prod.images[0].url.includes('unsplash.com'));
});

test('store saves rich editorial post with bold, colors, links and images', () => {
  const post = store.savePost({
    title: 'Top Studio Microphones 2026',
    type: 'blog',
    excerpt: 'Detailed comparison of vocal gear.',
    body_md: '### Introduction\n\nHere is a **bold recommendation** with <span style="color: #dc2626">highlighted text</span>.\n\n![Mic](data:image/png;base64,xyz)\n\n[Check Deal](https://amazon.com)'
  });

  assert.ok(post.id > 0);
  assert.equal(post.title, 'Top Studio Microphones 2026');
  assert.ok(post.body_md.includes('color: #dc2626'));
  assert.ok(post.body_md.includes('**bold recommendation**'));
});
