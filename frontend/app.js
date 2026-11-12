// Storefront Client Logic
var currentPostPage = 0;
var currentPostType = "all";
var currentCatalogFilters = {
  category: "",
  availability: "all",
  min_rating: 0,
  query: "",
  sort: "newest"
};

// Wishlist storage helpers
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  } catch (e) {
    return [];
  }
}

function updateWishlistBadge() {
  var list = getWishlist();
  var b1 = document.getElementById("wishlist-count");
  if (b1) {
    b1.textContent = String(list.length);
  }
  var b2 = document.getElementById("wishlist-count-badge");
  if (b2) {
    b2.textContent = String(list.length);
  }
}

function toggleWishlist(slug, btn) {
  var list = getWishlist();
  var idx = list.indexOf(slug);
  if (idx > -1) {
    list.splice(idx, 1);
    if (btn) {
      btn.classList.remove("wished");
    }
  } else {
    list.push(slug);
    if (btn) {
      btn.classList.add("wished");
    }
  }
  localStorage.setItem("wishlist", JSON.stringify(list));
  updateWishlistBadge();
}

// -----------------------------------------------------------------------------
// Posts & Feed Logic
// -----------------------------------------------------------------------------
function loadPosts() {
  var container = document.getElementById("posts-container");
  if (!container) {
    return;
  }

  var url = "/api/posts?limit=12&offset=" + (currentPostPage * 12);
  if (currentPostType !== "all") {
    url += "&type=" + encodeURIComponent(currentPostType);
  }

  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(res) {
      container.innerHTML = "";
      var posts = res.posts || [];
      if (posts.length === 0) {
        container.innerHTML = "<p style=\"color:var(--ink-muted);\">No posts found in this section.</p>";
        return;
      }
      for (var i = 0; i < posts.length; i++) {
        var p = posts[i];
        var card = document.createElement("article");
        card.className = "post-card";
        card.setAttribute("onclick", "viewPost('" + p.slug + "')");

        var html = "";
        if (p.cover_image) {
          html += "<img src=\"" + p.cover_image + "\" alt=\"" + p.title + "\" class=\"post-card-thumb\">";
        }
        html += "<div class=\"post-meta\"><span>" + p.type + "</span> &bull; <span>" + (p.reading_minutes || 3) + " min read</span></div>";
        html += "<h2 class=\"post-title\">" + p.title + "</h2>";
        html += "<p class=\"post-excerpt\">" + (p.excerpt || "") + "</p>";
        html += "<div style=\"font-weight:600; color:var(--primary); font-size:0.9rem;\">Read post &rarr;</div>";

        card.innerHTML = html;
        container.appendChild(card);
      }
    })
    .catch(function(err) {
      console.error("Failed to load posts", err);
    });
}

function filterPosts(type, btn) {
  currentPostType = type;
  currentPostPage = 0;
  var btns = document.querySelectorAll(".chip-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove("active");
  }
  if (btn) {
    btn.classList.add("active");
  }
  loadPosts();
}

function viewPost(slug) {
  fetch("/api/posts/" + slug)
    .then(function(r) { return r.json(); })
    .then(function(p) {
      var body = document.getElementById("post-modal-body");
      var html = "<div class=\"post-meta\"><span>" + p.type + "</span> &bull; <span>" + (p.reading_minutes || 3) + " min read</span></div>";
      html += "<h1 style=\"font-family:var(--font-serif); font-size:1.85rem; margin-bottom:14px;\">" + p.title + "</h1>";
      if (p.cover_image) {
        html += "<img src=\"" + p.cover_image + "\" style=\"width:100%; max-height:360px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:18px;\">";
      }
      if (p.video_id) {
        html += "<div style=\"position:relative; padding-bottom:56.25%; height:0; margin-bottom:20px;\"><iframe src=\"https://www.youtube-nocookie.com/embed/" + p.video_id + "\" style=\"position:absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius:var(--radius-md);\" allowfullscreen></iframe></div>";
      }
      html += "<div style=\"line-height:1.75; margin-bottom:24px;\">" + (p.body_md || "").replace(/\n\n/g, "<br><br>") + "</div>";
      if (p.link_url) {
        html += "<div style=\"background:var(--surface-raised); padding:16px; border-radius:var(--radius-md); margin-bottom:20px;\"><strong>External Source:</strong> <a href=\"" + p.link_url + "\" target=\"_blank\" rel=\"noopener noreferrer nofollow\" style=\"color:var(--primary); text-decoration:underline;\">" + (p.link_title || p.link_url) + "</a></div>";
      }
      body.innerHTML = html;

      document.getElementById("comment-post-slug").value = slug;
      loadComments(slug);

      // Pre-fill remembered author
      var savedName = localStorage.getItem("comment_author_name");
      if (savedName) {
        document.getElementById("comment-author").value = savedName;
      }

      document.getElementById("post-modal").style.display = "flex";
    })
    .catch(function(err) {
      console.error(err);
    });
}

function closePostModal() {
  document.getElementById("post-modal").style.display = "none";
}

// Comments logic
function loadComments(slug) {
  var list = document.getElementById("comments-list");
  list.innerHTML = "<p style=\"color:var(--ink-muted); font-size:0.9rem;\">Loading discussion...</p>";
  fetch("/api/comments?post_slug=" + slug)
    .then(function(r) { return r.json(); })
    .then(function(comments) {
      list.innerHTML = "";
      if (comments.length === 0) {
        list.innerHTML = "<p style=\"color:var(--ink-muted); font-size:0.9rem;\">No comments yet. Start the conversation!</p>";
        return;
      }
      for (var i = 0; i < comments.length; i++) {
        var c = comments[i];
        var div = document.createElement("div");
        div.style.padding = "12px 0";
        div.style.borderBottom = "1px solid var(--line)";
        var badge = c.is_owner ? " <span class=\"badge\" style=\"background:var(--accent); color:var(--surface);\">Author</span>" : "";
        div.innerHTML = "<strong>" + c.author_name + badge + "</strong> <span style=\"font-size:0.75rem; color:var(--ink-faint);\">" + (c.created_at || "").slice(0, 10) + "</span><p style=\"margin-top:4px;\">" + c.body + "</p>";
        list.appendChild(div);
      }
    })
    .catch(function(err) {
      list.innerHTML = "<p style=\"color:var(--danger);\">Unable to load comments.</p>";
    });
}

function submitComment(e) {
  e.preventDefault();
  var slug = document.getElementById("comment-post-slug").value;
  var author = document.getElementById("comment-author").value;
  var body = document.getElementById("comment-body").value;
  var hp = document.getElementById("comment-hp").value;
  var remember = document.getElementById("comment-remember").checked;

  if (remember) {
    localStorage.setItem("comment_author_name", author);
  } else {
    localStorage.removeItem("comment_author_name");
  }

  fetch("/api/comments", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({postSlug: slug, name: author, body: body, hp: hp})
  })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      document.getElementById("comment-body").value = "";
      loadComments(slug);
      if (res.data && res.data.status === "pending") {
        alert("Your comment has been received and is awaiting moderation approval.");
      }
    })
    .catch(function(err) {
      alert("Submission error. Please try again.");
    });
}

// -----------------------------------------------------------------------------
// Products Catalog Logic
// -----------------------------------------------------------------------------
function loadCatalog() {
  var grid = document.getElementById("products-grid");
  if (!grid) {
    return;
  }

  var url = "/api/products?limit=24&sort=" + currentCatalogFilters.sort;
  if (currentCatalogFilters.category) {
    url += "&category=" + encodeURIComponent(currentCatalogFilters.category);
  }
  if (currentCatalogFilters.availability && currentCatalogFilters.availability !== "all") {
    url += "&availability=" + encodeURIComponent(currentCatalogFilters.availability);
  }
  if (currentCatalogFilters.min_rating > 0) {
    url += "&min_rating=" + encodeURIComponent(currentCatalogFilters.min_rating);
  }
  if (currentCatalogFilters.query) {
    url += "&q=" + encodeURIComponent(currentCatalogFilters.query);
  }

  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(res) {
      grid.innerHTML = "";
      var products = res.products || [];
      if (products.length === 0) {
        grid.innerHTML = "<p style=\"color:var(--ink-muted);\">No products match your filter selection.</p>";
        return;
      }
      var wishlist = getWishlist();

      for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var isWished = wishlist.indexOf(p.slug) > -1;
        var card = document.createElement("div");
        card.className = "product-card";

        var thumb = (p.images && p.images[0]) ? p.images[0].url : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
        var priceDisplay = p.price_minor ? ("₹" + (p.price_minor / 100).toLocaleString()) : "Check Store";
        var origDisplay = p.original_price_minor ? ("₹" + (p.original_price_minor / 100).toLocaleString()) : "";

        var html = "<button class=\"wish-btn " + (isWished ? "wished" : "") + "\" onclick=\"toggleWishlist('" + p.slug + "', this)\" title=\"Save to Wishlist\">&hearts;</button>";
        html += "<img src=\"" + thumb + "\" alt=\"" + p.name + "\" class=\"prod-thumb\" onclick=\"viewProductDetail('" + p.slug + "')\">";
        html += "<div class=\"prod-brand\">" + (p.brand || "") + "</div>";
        html += "<h2 class=\"prod-name\" onclick=\"viewProductDetail('" + p.slug + "')\">" + p.name + "</h2>";
        html += "<div class=\"rating-row\"><span class=\"star-icon\">&#9733;</span> <strong>" + (p.rating_avg || 0) + "</strong> <span>(" + (p.rating_count || 0) + ")</span></div>";
        html += "<div class=\"price-row\"><span class=\"price-current\">" + priceDisplay + "</span>";
        if (origDisplay) {
          html += "<span class=\"price-orig\">" + origDisplay + "</span>";
        }
        html += "</div>";
        html += "<div style=\"display:flex; gap:8px;\">";
        html += "<button class=\"btn-secondary\" style=\"flex:1;\" onclick=\"viewProductDetail('" + p.slug + "')\">Details</button>";
        html += "<a href=\"/go/" + p.slug + "\" target=\"_blank\" rel=\"sponsored nofollow noopener\" class=\"btn-primary\" style=\"flex:1;\">Buy Store</a>";
        html += "</div>";

        card.innerHTML = html;
        grid.appendChild(card);
      }
    })
    .catch(function(err) {
      console.error(err);
    });
}

function handleCatalogSearch(val) {
  currentCatalogFilters.query = val;
  loadCatalog();
}

function handleCatalogSort(val) {
  currentCatalogFilters.sort = val;
  loadCatalog();
}

function filterCategory(slug) {
  currentCatalogFilters.category = slug;
  loadCatalog();
}

function filterAvailability(status) {
  currentCatalogFilters.availability = status;
  loadCatalog();
}

function filterRating(stars) {
  currentCatalogFilters.min_rating = stars;
  loadCatalog();
}

function resetAllFilters() {
  currentCatalogFilters = {category: "", availability: "all", min_rating: 0, query: "", sort: "newest"};
  var s = document.getElementById("catalog-search");
  if (s) { s.value = ""; }
  var rads = document.querySelectorAll("input[type=radio]");
  for (var i = 0; i < rads.length; i++) {
    if (rads[i].value === "" || rads[i].value === "all" || rads[i].value === "0") {
      rads[i].checked = true;
    }
  }
  loadCatalog();
}

function viewProductDetail(slug) {
  fetch("/api/products/" + slug)
    .then(function(r) { return r.json(); })
    .then(function(p) {
      var body = document.getElementById("product-modal-body");
      var thumb = (p.images && p.images[0]) ? p.images[0].url : "";
      var priceDisplay = p.price_minor ? ("₹" + (p.price_minor / 100).toLocaleString()) : "Check Store";

      var html = "<div style=\"display:flex; gap:20px; flex-wrap:wrap; margin-bottom:20px;\">";
      if (thumb) {
        html += "<img src=\"" + thumb + "\" style=\"width:240px; height:240px; object-fit:cover; border-radius:var(--radius-md);\">";
      }
      html += "<div style=\"flex:1; min-width:260px;\">";
      html += "<div class=\"prod-brand\">" + (p.brand || "") + "</div>";
      html += "<h1 style=\"font-family:var(--font-serif); font-size:1.6rem; margin-bottom:8px;\">" + p.name + "</h1>";
      html += "<div class=\"rating-row\"><span class=\"star-icon\">&#9733;</span> <strong>" + (p.rating_avg || 0) + "</strong> <span>(" + (p.rating_count || 0) + " verified ratings)</span></div>";
      html += "<div class=\"price-row\" style=\"margin-top:8px;\"><span class=\"price-current\" style=\"font-size:1.5rem;\">" + priceDisplay + "</span></div>";

      // Store Offers
      html += "<div style=\"margin-top:14px;\"><strong style=\"font-size:0.9rem;\">Store Offers:</strong><div style=\"display:flex; gap:10px; margin-top:6px; flex-wrap:wrap;\">";
      var offers = p.offers || [];
      for (var o = 0; o < offers.length; o++) {
        var off = offers[o];
        var offPrice = off.price_minor ? ("₹" + (off.price_minor / 100).toLocaleString()) : "";
        html += "<a href=\"/go/" + p.slug + "/" + off.id + "\" target=\"_blank\" rel=\"sponsored nofollow noopener\" class=\"btn-primary\" style=\"font-size:0.875rem;\">Buy on " + off.platform + (offPrice ? (" (" + offPrice + ")") : "") + "</a>";
      }
      html += "</div></div></div></div>";

      // Specs & Pros/Cons
      if (p.pros && p.pros.length > 0) {
        html += "<div style=\"margin-bottom:16px;\"><strong>Key Pros:</strong><ul style=\"margin-left:20px; margin-top:6px; color:var(--ink-muted);\">";
        for (var pr = 0; pr < p.pros.length; pr++) {
          html += "<li>" + p.pros[pr] + "</li>";
        }
        html += "</ul></div>";
      }

      if (p.specs && p.specs.length > 0) {
        html += "<div style=\"margin-bottom:16px;\"><strong>Technical Specifications:</strong><table class=\"data-table\" style=\"margin-top:8px;\">";
        for (var sp = 0; sp < p.specs.length; sp++) {
          html += "<tr><td style=\"font-weight:600; width:40%;\">" + p.specs[sp].label + "</td><td>" + p.specs[sp].value + "</td></tr>";
        }
        html += "</table></div>";
      }

      body.innerHTML = html;
      document.getElementById("review-product-slug").value = slug;
      loadProductReviews(slug);

      document.getElementById("product-modal").style.display = "flex";
    })
    .catch(function(err) {
      console.error(err);
    });
}

function closeProductModal() {
  document.getElementById("product-modal").style.display = "none";
}

function loadProductReviews(slug) {
  var list = document.getElementById("reviews-list");
  list.innerHTML = "<p style=\"color:var(--ink-muted);\">Loading reviews...</p>";
  fetch("/api/reviews?product_slug=" + slug)
    .then(function(r) { return r.json(); })
    .then(function(revs) {
      list.innerHTML = "";
      if (revs.length === 0) {
        list.innerHTML = "<p style=\"color:var(--ink-muted); font-size:0.9rem;\">No customer reviews yet. Be the first to share your experience!</p>";
        return;
      }
      for (var i = 0; i < revs.length; i++) {
        var r = revs[i];
        var d = document.createElement("div");
        d.style.padding = "12px 0";
        d.style.borderBottom = "1px solid var(--line)";
        var stars = "";
        for (var s = 0; s < r.rating; s++) { stars += "&#9733;"; }
        var rep = r.owner_reply ? ("<div style=\"background:var(--accent-light); padding:8px 12px; border-radius:var(--radius-sm); margin-top:8px; font-size:0.875rem;\"><strong>Author Reply:</strong> " + r.owner_reply + "</div>") : "";
        d.innerHTML = "<div><span class=\"star-icon\">" + stars + "</span> <strong>" + (r.title || "") + "</strong></div><div style=\"font-size:0.8rem; color:var(--ink-faint);\">By " + r.author_name + " on " + (r.created_at || "").slice(0, 10) + "</div><p style=\"margin-top:6px;\">" + r.body + "</p>" + rep;
        list.appendChild(d);
      }
    })
    .catch(function(err) {
      list.innerHTML = "<p style=\"color:var(--danger);\">Unable to load reviews.</p>";
    });
}

function toggleReviewForm() {
  var f = document.getElementById("review-form-container");
  f.style.display = f.style.display === "none" ? "block" : "none";
}

function submitReview(e) {
  e.preventDefault();
  var slug = document.getElementById("review-product-slug").value;
  var name = document.getElementById("review-name").value;
  var rating = document.getElementById("review-rating").value;
  var title = document.getElementById("review-title").value;
  var body = document.getElementById("review-body").value;
  var hp = document.getElementById("review-hp").value;

  fetch("/api/reviews", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({productSlug: slug, name: name, rating: rating, title: title, body: body, hp: hp})
  })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      document.getElementById("review-body").value = "";
      toggleReviewForm();
      loadProductReviews(slug);
      if (res.data && res.data.status === "pending") {
        alert("Thank you! Your review is awaiting moderation approval.");
      }
    })
    .catch(function(err) {
      alert("Review submission failed. Please try again.");
    });
}

// Wishlist Modal
function openWishlistModal() {
  var modal = document.getElementById("wishlist-modal");
  var container = document.getElementById("wishlist-items-container");
  var list = getWishlist();
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = "<p style=\"color:var(--ink-muted);\">Your saved wishlist is currently empty.</p>";
  } else {
    for (var i = 0; i < list.length; i++) {
      var slug = list[i];
      var div = document.createElement("div");
      div.style.padding = "10px 0";
      div.style.borderBottom = "1px solid var(--line)";
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.alignItems = "center";
      div.innerHTML = "<span><strong>" + slug + "</strong></span><div><button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem;\" onclick=\"viewProductDetail('" + slug + "')\">View</button> <button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem; color:var(--danger);\" onclick=\"removeWishItem('" + slug + "')\">Remove</button></div>";
      container.appendChild(div);
    }
  }
  modal.style.display = "flex";
}

function removeWishItem(slug) {
  var list = getWishlist();
  var idx = list.indexOf(slug);
  if (idx > -1) {
    list.splice(idx, 1);
    localStorage.setItem("wishlist", JSON.stringify(list));
    updateWishlistBadge();
    openWishlistModal();
    loadCatalog();
  }
}

function closeWishlistModal() {
  document.getElementById("wishlist-modal").style.display = "none";
}

// Legal and About Static Modals
function openPageModal(type) {
  var modal = document.getElementById("page-modal");
  var content = document.getElementById("page-modal-content");
  var titles = {
    about: "About Me & Editorial Standards",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    disclosure: "Affiliate Disclosure",
    contact: "Contact & Sponsorship"
  };

  var bodies = {
    about: "<p>Welcome to our independent tech and audio editorial hub. Every review is based on direct hands-on testing with no sponsored bias.</p><p style=\"margin-top:12px;\">Products are acquired either through personal purchase or temporary evaluation loans from manufacturers under strict non-interference terms.</p>",
    terms: "<p>By browsing this site, you agree to these Terms. All product names, logos, and brands are property of their respective owners. Content on this site is provided for general informational and educational guidance.</p><p style=\"margin-top:12px;\">Prices and availability change frequently at retail partner destinations. Always confirm final checkout pricing before placing orders.</p>",
    privacy: "<p>We do not collect personal data without your active consent. When you submit comments or reviews, your name is displayed publicly while your browser stores an editing token locally on your device.</p><p style=\"margin-top:12px;\">No tracking pixels or third-party behavioral profiling scripts are used. You may clear your browser data at any time to purge local preferences.</p>",
    disclosure: "<p>This site participates in affiliate programs including Amazon Associates, Flipkart, and brand-direct networks. When you click through our curated store links and make a purchase, we may receive a modest commission at zero additional charge to you.</p>",
    contact: "<form onsubmit=\"handleContactSubmit(event)\"><div class=\"form-group\"><label class=\"form-label\">Reason</label><select id=\"contact-cat\" class=\"form-control\"><option value=\"sponsorship\">Sponsorship / Brand Inquiry</option><option value=\"feedback\">General Feedback</option><option value=\"product_suggestion\">Product Suggestion</option><option value=\"other\">Other</option></select></div><div class=\"form-group\"><label class=\"form-label\">Name</label><input type=\"text\" id=\"contact-name\" class=\"form-control\" required></div><div class=\"form-group\"><label class=\"form-label\">Email</label><input type=\"email\" id=\"contact-email\" class=\"form-control\" required></div><div class=\"form-group\"><label class=\"form-label\">Message</label><textarea id=\"contact-msg\" class=\"form-control\" rows=\"4\" required></textarea></div><button type=\"submit\" class=\"btn-primary\" style=\"width:100%;\">Send Message</button></form>"
  };

  content.innerHTML = "<h2 style=\"font-family:var(--font-serif); font-size:1.6rem; margin-bottom:14px;\">" + titles[type] + "</h2>" + bodies[type];
  modal.style.display = "flex";
}

function closePageModal() {
  document.getElementById("page-modal").style.display = "none";
}

function handleContactSubmit(e) {
  e.preventDefault();
  var cat = document.getElementById("contact-cat").value;
  var name = document.getElementById("contact-name").value;
  var email = document.getElementById("contact-email").value;
  var msg = document.getElementById("contact-msg").value;

  fetch("/api/contact", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({category: cat, name: name, email: email, message: msg})
  })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      alert("Message received! Your reference number is: " + (res.data ? res.data.reference : "CONFIRMED"));
      closePageModal();
    })
    .catch(function(err) {
      alert("Unable to send message right now.");
    });
}

// Bootstrap
document.addEventListener("DOMContentLoaded", function() {
  updateWishlistBadge();
  loadPosts();
  loadCatalog();
});
