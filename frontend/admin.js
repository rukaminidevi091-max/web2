// Admin Dashboard & Manager Logic
var adminToken = sessionStorage.getItem("admin_token") || "";

function checkAdminAuth() {
  if (adminToken) {
    document.getElementById("admin-login-screen").style.display = "none";
    document.getElementById("admin-app").style.display = "grid";
    loadAdminOverview();
  } else {
    document.getElementById("admin-login-screen").style.display = "block";
    document.getElementById("admin-app").style.display = "none";
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  var pwd = document.getElementById("admin-pwd").value;
  var errEl = document.getElementById("login-error");
  errEl.style.display = "none";

  fetch("/api/admin/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({password: pwd})
  })
    .then(function(r) {
      if (!r.ok) {
        throw new Error("Invalid password");
      }
      return r.json();
    })
    .then(function(res) {
      adminToken = res.token;
      sessionStorage.setItem("admin_token", adminToken);
      checkAdminAuth();
    })
    .catch(function(err) {
      errEl.textContent = "Authentication failed. Please verify your password.";
      errEl.style.display = "block";
    });
}

function handleAdminLogout() {
  adminToken = "";
  sessionStorage.removeItem("admin_token");
  checkAdminAuth();
}

function adminFetch(url, options) {
  options = options || {};
  options.headers = options.headers || {};
  options.headers["Authorization"] = "Bearer " + adminToken;
  options.headers["Content-Type"] = "application/json";
  return fetch(url, options);
}

function switchAdminTab(tabName, el) {
  var navs = document.querySelectorAll(".admin-nav-item");
  for (var i = 0; i < navs.length; i++) {
    navs[i].classList.remove("active");
  }
  if (el) { el.classList.add("active"); }

  var views = ["overview", "products", "posts", "categories", "reviews", "comments", "inbox", "settings", "backup"];
  for (var v = 0; v < views.length; v++) {
    var sec = document.getElementById("view-" + views[v]);
    if (sec) {
      sec.style.display = views[v] === tabName ? "block" : "none";
    }
  }

  if (tabName === "overview") { loadAdminOverview(); }
  if (tabName === "products") { loadAdminProducts(); }
  if (tabName === "posts") { loadAdminPosts(); }
  if (tabName === "categories") { loadAdminCategories(); }
  if (tabName === "reviews") { loadAdminReviews(); }
  if (tabName === "comments") { loadAdminComments(); }
  if (tabName === "inbox") { loadAdminInbox(); }
  if (tabName === "settings") { loadAdminSettings(); }
}

// -----------------------------------------------------------------------------
// Admin Overview
// -----------------------------------------------------------------------------
function loadAdminOverview() {
  adminFetch("/api/admin/overview")
    .then(function(r) { return r.json(); })
    .then(function(s) {
      document.getElementById("stat-pending-reviews").textContent = String(s.pending_reviews || 0);
      document.getElementById("stat-pending-comments").textContent = String(s.pending_comments || 0);
      document.getElementById("stat-new-messages").textContent = String(s.new_messages || 0);
      document.getElementById("stat-total-clicks").textContent = String(s.total_clicks || 0);

      var tbody = document.querySelector("#top-products-table tbody");
      tbody.innerHTML = "";
      var topP = s.top_products || [];
      for (var i = 0; i < topP.length; i++) {
        var p = topP[i];
        var tr = document.createElement("tr");
        tr.innerHTML = "<td><strong>" + p.name + "</strong></td><td>" + (p.brand || "") + "</td><td>&#9733; " + (p.rating_avg || 0) + "</td><td>" + (p.click_count || 0) + "</td>";
        tbody.appendChild(tr);
      }
    })
    .catch(function(err) {
      console.error(err);
    });
}

// -----------------------------------------------------------------------------
// Admin Products Manager
// -----------------------------------------------------------------------------
function loadAdminProducts() {
  adminFetch("/api/admin/products")
    .then(function(r) { return r.json(); })
    .then(function(res) {
      var tbody = document.querySelector("#admin-products-table tbody");
      tbody.innerHTML = "";
      var list = res.products || [];
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var tr = document.createElement("tr");
        var priceDisplay = p.price_minor ? ("₹" + (p.price_minor / 100).toLocaleString()) : "--";
        tr.innerHTML = "<td><strong>" + p.name + "</strong></td><td>" + (p.brand || "") + "</td><td>" + priceDisplay + "</td><td><span class=\"badge\">" + p.status + "</span></td><td>" + (p.click_count || 0) + "</td><td><button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem;\" onclick=\"editProduct(" + p.id + ")\">Edit</button> <button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem; color:var(--danger);\" onclick=\"deleteProduct(" + p.id + ")\">Delete</button></td>";
        tbody.appendChild(tr);
      }
    })
    .catch(function(err) {
      console.error(err);
    });
}

function openProductEditor() {
  document.getElementById("form-prod-id").value = "";
  document.getElementById("form-prod-name").value = "";
  document.getElementById("form-prod-brand").value = "";
  document.getElementById("form-prod-price").value = "";
  document.getElementById("form-prod-summary").value = "";
  document.getElementById("form-prod-url").value = "";
  document.getElementById("form-prod-image").value = "";
  document.getElementById("prod-modal-title").textContent = "Add New Product";
  document.getElementById("admin-product-modal").style.display = "flex";
}

function closeAdminProductModal() {
  document.getElementById("admin-product-modal").style.display = "none";
}

function editProduct(pid) {
  adminFetch("/api/admin/products")
    .then(function(r) { return r.json(); })
    .then(function(res) {
      var p = (res.products || []).find(function(item) { return item.id === pid; });
      if (!p) { return; }
      document.getElementById("form-prod-id").value = p.id;
      document.getElementById("form-prod-name").value = p.name;
      document.getElementById("form-prod-brand").value = p.brand || "";
      document.getElementById("form-prod-price").value = p.price_minor || "";
      document.getElementById("form-prod-summary").value = p.summary || "";
      var primaryOffer = (p.offers && p.offers[0]) ? p.offers[0].url : "";
      document.getElementById("form-prod-url").value = primaryOffer;
      var primaryImg = (p.images && p.images[0]) ? p.images[0].url : "";
      document.getElementById("form-prod-image").value = primaryImg;
      document.getElementById("prod-modal-title").textContent = "Edit Product #" + pid;
      document.getElementById("admin-product-modal").style.display = "flex";
    });
}

function saveProductFromForm(e) {
  e.preventDefault();
  var pid = document.getElementById("form-prod-id").value;
  var name = document.getElementById("form-prod-name").value;
  var brand = document.getElementById("form-prod-brand").value;
  var price = parseInt(document.getElementById("form-prod-price").value, 10);
  var summary = document.getElementById("form-prod-summary").value;
  var url = document.getElementById("form-prod-url").value;
  var img = document.getElementById("form-prod-image").value;
  var status = document.getElementById("form-prod-status").value;
  var featured = document.getElementById("form-prod-featured").value === "true";

  var payload = {
    name: name,
    brand: brand,
    price_minor: price,
    summary: summary,
    status: status,
    featured: featured,
    offers: [{id: 1, platform: "Primary Retailer", url: url, price_minor: price, is_primary: true}],
    images: [{url: img || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", alt_text: name}]
  };
  if (pid) {
    payload.id = parseInt(pid, 10);
  }

  adminFetch("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then(function() {
      closeAdminProductModal();
      loadAdminProducts();
    })
    .catch(function(err) {
      alert("Failed to save product");
    });
}

function deleteProduct(pid) {
  if (!confirm("Are you sure you want to delete product #" + pid + "?")) {
    return;
  }
  adminFetch("/api/admin/products/" + pid, {method: "DELETE"})
    .then(function() {
      loadAdminProducts();
    });
}

// -----------------------------------------------------------------------------
// Admin Moderation
// -----------------------------------------------------------------------------
function loadAdminReviews() {
  adminFetch("/api/admin/reviews")
    .then(function(r) { return r.json(); })
    .then(function(revs) {
      var tbody = document.querySelector("#admin-reviews-table tbody");
      tbody.innerHTML = "";
      for (var i = 0; i < revs.length; i++) {
        var r = revs[i];
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + r.product_slug + "</td><td>" + r.author_name + "</td><td>&#9733; " + r.rating + "</td><td>" + r.body + "</td><td><span class=\"badge\">" + r.status + "</span></td><td><button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem;\" onclick=\"moderateReviewAction(" + r.id + ", 'approve')\">Approve</button> <button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem; color:var(--danger);\" onclick=\"moderateReviewAction(" + r.id + ", 'spam')\">Spam</button></td>";
        tbody.appendChild(tr);
      }
    });
}

function moderateReviewAction(rid, action) {
  adminFetch("/api/admin/reviews/" + rid + "/moderate", {
    method: "POST",
    body: JSON.stringify({action: action})
  }).then(function() {
    loadAdminReviews();
  });
}

function loadAdminComments() {
  adminFetch("/api/admin/comments")
    .then(function(r) { return r.json(); })
    .then(function(comms) {
      var tbody = document.querySelector("#admin-comments-table tbody");
      tbody.innerHTML = "";
      for (var i = 0; i < comms.length; i++) {
        var c = comms[i];
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + c.post_slug + "</td><td>" + c.author_name + "</td><td>" + c.body + "</td><td><span class=\"badge\">" + c.status + "</span></td><td><button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem;\" onclick=\"moderateCommentAction(" + c.id + ", 'approve')\">Approve</button> <button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem; color:var(--danger);\" onclick=\"moderateCommentAction(" + c.id + ", 'spam')\">Spam</button></td>";
        tbody.appendChild(tr);
      }
    });
}

function moderateCommentAction(cid, action) {
  adminFetch("/api/admin/comments/" + cid + "/moderate", {
    method: "POST",
    body: JSON.stringify({action: action})
  }).then(function() {
    loadAdminComments();
  });
}

// -----------------------------------------------------------------------------
// Admin Inbox
// -----------------------------------------------------------------------------
function loadAdminInbox() {
  adminFetch("/api/admin/inbox")
    .then(function(r) { return r.json(); })
    .then(function(msgs) {
      var tbody = document.querySelector("#admin-inbox-table tbody");
      tbody.innerHTML = "";
      for (var i = 0; i < msgs.length; i++) {
        var m = msgs[i];
        var tr = document.createElement("tr");
        tr.innerHTML = "<td><span class=\"badge\">" + m.category + "</span></td><td><strong>" + m.name + "</strong> (" + m.email + ")</td><td>" + m.subject + "</td><td>" + m.message + "</td><td>" + m.status + "</td>";
        tbody.appendChild(tr);
      }
    });
}

// -----------------------------------------------------------------------------
// Admin Settings & Theming
// -----------------------------------------------------------------------------
function loadAdminSettings() {
  fetch("/api/settings")
    .then(function(r) { return r.json(); })
    .then(function(s) {
      document.getElementById("setting-site-name").value = s.site_name || "";
      document.getElementById("setting-tagline").value = s.tagline || "";
      document.getElementById("setting-hero-heading").value = s.hero_heading || "";
      document.getElementById("setting-hero-text").value = s.hero_text || "";
      document.getElementById("setting-color-primary").value = s.color_primary || "#253b2b";
      document.getElementById("setting-color-accent").value = s.color_accent || "#8fa58a";
      document.getElementById("setting-announcement").value = s.announcement_text || "";
    });
}

function handleSettingsUpdate(e) {
  e.preventDefault();
  var payload = {
    site_name: document.getElementById("setting-site-name").value,
    tagline: document.getElementById("setting-tagline").value,
    hero_heading: document.getElementById("setting-hero-heading").value,
    hero_text: document.getElementById("setting-hero-text").value,
    color_primary: document.getElementById("setting-color-primary").value,
    color_accent: document.getElementById("setting-color-accent").value,
    announcement_text: document.getElementById("setting-announcement").value,
    announcement_active: Boolean(document.getElementById("setting-announcement").value)
  };

  adminFetch("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload)
  })
    .then(function() {
      alert("Settings saved successfully!");
      location.reload();
    });
}

function exportDataJson() {
  adminFetch("/api/admin/export")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "hub-backup-" + new Date().toISOString().slice(0,10) + ".json";
      a.click();
    });
}

document.addEventListener("DOMContentLoaded", function() {
  checkAdminAuth();
});
