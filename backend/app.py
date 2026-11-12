"""
backend/app.py — Flask REST API and static page router for the Content & Catalog Hub.
"""

import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime
from functools import wraps
from flask import Flask, request, jsonify, redirect, send_from_directory, Response
from flask_cors import CORS
import store

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")
SECRET_KEY = os.environ.get("SECRET_KEY", "hub-secure-default-key-2026")

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        custom_header = request.headers.get("X-Admin-Token", "")
        token = auth_header.replace("Bearer ", "").strip() or custom_header.strip()
        if not token or token != ADMIN_PASSWORD:
            return jsonify({"error": {"code": "unauthenticated", "message": "Admin authorization required"}}), 401
        return f(*args, **kwargs)
    return decorated

# ------------------------------------------------------------------------------
# Frontend Page Routes
# ------------------------------------------------------------------------------
@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/product")
@app.route("/products")
@app.route("/products.html")
def products_page():
    return send_from_directory(FRONTEND_DIR, "products.html")

@app.route("/admin")
@app.route("/admin.html")
def admin_page():
    return send_from_directory(FRONTEND_DIR, "admin.html")

@app.route("/<path:path>")
def static_proxy(path):
    # Security: restrict to frontend folder
    full_path = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(full_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")

# ------------------------------------------------------------------------------
# Affiliate Tracked Redirect
# ------------------------------------------------------------------------------
@app.route("/go/<slug>")
@app.route("/go/<slug>/<int:offer_id>")
def affiliate_redirect(slug, offer_id=None):
    target_url = store.increment_click_count(slug, offer_id)
    if not target_url:
        return redirect("/product", code=302)
    response = redirect(target_url, code=302)
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# ------------------------------------------------------------------------------
# Public API
# ------------------------------------------------------------------------------
@app.route("/api/settings", methods=["GET"])
def get_public_settings():
    s = store.get_settings()
    # Mask private fields
    safe = {k: v for k, v in s.items() if not k.startswith("contact_notify")}
    return jsonify(safe)

@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify(store.get_categories(visible_only=True))

@app.route("/api/products", methods=["GET"])
def list_products():
    category = request.args.get("category")
    subcategory = request.args.get("subcategory")
    availability = request.args.get("availability")
    platform = request.args.get("platform")
    brand = request.args.get("brand")
    min_rating = request.args.get("min_rating")
    sort = request.args.get("sort", "newest")
    query = request.args.get("q")
    limit = int(request.args.get("limit", 24))
    offset = int(request.args.get("offset", 0))

    result = store.get_products(
        category=category,
        subcategory=subcategory,
        availability=availability,
        platform=platform,
        brand=brand,
        min_rating=min_rating,
        sort=sort,
        query=query,
        status="published",
        limit=limit,
        offset=offset
    )
    return jsonify(result)

@app.route("/api/products/<slug>", methods=["GET"])
def get_product(slug):
    p = store.get_product_by_slug(slug)
    if not p or p.get("status") != "published":
        return jsonify({"error": {"code": "not_found", "message": "Product not found"}}), 404
    return jsonify(p)

@app.route("/api/posts", methods=["GET"])
def list_posts():
    post_type = request.args.get("type")
    tag = request.args.get("tag")
    limit = int(request.args.get("limit", 12))
    offset = int(request.args.get("offset", 0))

    result = store.get_posts(
        post_type=post_type,
        tag=tag,
        status="published",
        limit=limit,
        offset=offset
    )
    return jsonify(result)

@app.route("/api/posts/<slug>", methods=["GET"])
def get_post(slug):
    p = store.get_post_by_slug(slug)
    if not p or p.get("status") != "published":
        return jsonify({"error": {"code": "not_found", "message": "Post not found"}}), 404
    return jsonify(p)

# ------------------------------------------------------------------------------
# Reviews API (Public Submit / Edit / Delete with Token)
# ------------------------------------------------------------------------------
@app.route("/api/reviews", methods=["GET"])
def list_reviews():
    product_slug = request.args.get("product_slug")
    if not product_slug:
        return jsonify({"error": {"code": "bad_request", "message": "product_slug is required"}}), 400
    return jsonify(store.get_reviews(product_slug))

@app.route("/api/reviews", methods=["POST"])
def create_review():
    data = request.get_json() or {}
    # Honeypot validation
    if data.get("hp"):
        return jsonify({"error": {"code": "forbidden", "message": "Automated submission rejected"}}), 403

    product_slug = data.get("productSlug") or data.get("product_slug")
    name = (data.get("name") or "").strip()
    rating = data.get("rating")
    body = (data.get("body") or "").strip()
    title = (data.get("title") or "").strip()

    if not product_slug or not name or not rating or not body:
        return jsonify({"error": {"code": "validation_failed", "message": "Missing required fields"}}), 422

    # Check settings for hold-all or links
    settings = store.get_settings()
    has_links = bool(re.search(r"https?://", body))
    status = "pending" if (settings.get("hold_all_reviews") or has_links) else "published"

    review, edit_token = store.add_review(product_slug, name, rating, title, body, status=status)
    return jsonify({
        "data": {
            "public_id": review["public_id"],
            "product_slug": review["product_slug"],
            "author_name": review["author_name"],
            "rating": review["rating"],
            "title": review["title"],
            "body": review["body"],
            "status": review["status"],
            "created_at": review["created_at"]
        },
        "editToken": edit_token
    }), 201

@app.route("/api/reviews/<public_id>", methods=["PATCH"])
def edit_review_route(public_id):
    data = request.get_json() or {}
    edit_token = request.headers.get("X-Edit-Token", "") or data.get("editToken", "")
    new_body = data.get("body")
    if not edit_token or not new_body:
        return jsonify({"error": {"code": "validation_failed", "message": "editToken and body required"}}), 422

    rev, err = store.edit_review(public_id, edit_token, new_body, data.get("rating"), data.get("title"))
    if err:
        return jsonify({"error": {"code": "forbidden", "message": err}}), 403
    return jsonify({"data": rev})

@app.route("/api/reviews/<public_id>", methods=["DELETE"])
def delete_review_route(public_id):
    edit_token = request.headers.get("X-Edit-Token", "")
    if not edit_token:
        data = request.get_json() or {}
        edit_token = data.get("editToken", "")
    if not edit_token:
        return jsonify({"error": {"code": "forbidden", "message": "X-Edit-Token header required"}}), 403

    ok, err = store.delete_review(public_id, edit_token)
    if not ok:
        return jsonify({"error": {"code": "forbidden", "message": err}}), 403
    return "", 204

# ------------------------------------------------------------------------------
# Comments API (Public Submit / Edit / Delete with Token)
# ------------------------------------------------------------------------------
@app.route("/api/comments", methods=["GET"])
def list_comments():
    post_slug = request.args.get("post_slug")
    if not post_slug:
        return jsonify({"error": {"code": "bad_request", "message": "post_slug required"}}), 400
    return jsonify(store.get_comments(post_slug))

@app.route("/api/comments", methods=["POST"])
def create_comment():
    data = request.get_json() or {}
    if data.get("hp"):
        return jsonify({"error": {"code": "forbidden", "message": "Automated submission rejected"}}), 403

    post_slug = data.get("postSlug") or data.get("post_slug")
    name = (data.get("name") or "").strip()
    body = (data.get("body") or "").strip()
    parent_id = data.get("parentId")

    if not post_slug or not name or not body:
        return jsonify({"error": {"code": "validation_failed", "message": "Missing required fields"}}), 422

    settings = store.get_settings()
    has_links = bool(re.search(r"https?://", body))
    status = "pending" if (settings.get("hold_all_comments") or has_links) else "published"

    comm, edit_token = store.add_comment(post_slug, name, body, parent_id=parent_id, is_owner=False, status=status)
    return jsonify({
        "data": {
            "public_id": comm["public_id"],
            "post_slug": comm["post_slug"],
            "parent_id": comm["parent_id"],
            "author_name": comm["author_name"],
            "body": comm["body"],
            "status": comm["status"],
            "created_at": comm["created_at"]
        },
        "editToken": edit_token
    }), 201

@app.route("/api/comments/<public_id>", methods=["PATCH"])
def edit_comment_route(public_id):
    data = request.get_json() or {}
    edit_token = request.headers.get("X-Edit-Token", "") or data.get("editToken", "")
    new_body = data.get("body")
    if not edit_token or not new_body:
        return jsonify({"error": {"code": "validation_failed", "message": "editToken and body required"}}), 422

    comm, err = store.edit_comment(public_id, edit_token, new_body)
    if err:
        return jsonify({"error": {"code": "forbidden", "message": err}}), 403
    return jsonify({"data": comm})

@app.route("/api/comments/<public_id>", methods=["DELETE"])
def delete_comment_route(public_id):
    edit_token = request.headers.get("X-Edit-Token", "") or (request.get_json() or {}).get("editToken", "")
    if not edit_token:
        return jsonify({"error": {"code": "forbidden", "message": "X-Edit-Token required"}}), 403

    ok, err = store.delete_comment(public_id, edit_token)
    if not ok:
        return jsonify({"error": {"code": "forbidden", "message": err}}), 403
    return "", 204

# ------------------------------------------------------------------------------
# Contact API
# ------------------------------------------------------------------------------
@app.route("/api/contact", methods=["POST"])
def submit_contact():
    data = request.get_json() or {}
    if data.get("hp"):
        return jsonify({"error": {"code": "forbidden", "message": "Spam rejected"}}), 403

    category = data.get("category", "other")
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"error": {"code": "validation_failed", "message": "Name, email and message required"}}), 422

    msg = store.add_contact(
        category=category,
        name=name,
        email=email,
        subject=subject or "General Inquiry",
        message=message,
        company=data.get("company", ""),
        website=data.get("website", "")
    )
    return jsonify({"data": {"reference": "MSG-" + str(msg["id"]), "status": "received"}}), 201

# ------------------------------------------------------------------------------
# Admin API
# ------------------------------------------------------------------------------
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json() or {}
    pwd = data.get("password", "")
    if pwd == ADMIN_PASSWORD:
        return jsonify({"ok": True, "token": ADMIN_PASSWORD})
    return jsonify({"error": {"code": "unauthenticated", "message": "Invalid password"}}), 401

@app.route("/api/admin/overview", methods=["GET"])
@admin_required
def admin_overview():
    return jsonify(store.get_overview())

@app.route("/api/admin/settings", methods=["PUT"])
@admin_required
def admin_update_settings():
    data = request.get_json() or {}
    updated = store.update_settings(data)
    return jsonify(updated)

# Admin Posts CRUD
@app.route("/api/admin/posts", methods=["GET"])
@admin_required
def admin_list_posts():
    return jsonify(store.get_posts(status=None, limit=None))

@app.route("/api/admin/posts", methods=["POST"])
@admin_required
def admin_save_post():
    data = request.get_json() or {}
    saved = store.save_post(data)
    return jsonify(saved), 201

@app.route("/api/admin/posts/<int:pid>", methods=["DELETE"])
@admin_required
def admin_delete_post(pid):
    store.delete_post(pid)
    return "", 204

# Admin Products CRUD
@app.route("/api/admin/products", methods=["GET"])
@admin_required
def admin_list_products():
    return jsonify(store.get_products(status=None, limit=None))

@app.route("/api/admin/products", methods=["POST"])
@admin_required
def admin_save_product():
    data = request.get_json() or {}
    saved = store.save_product(data)
    return jsonify(saved), 201

@app.route("/api/admin/products/<int:pid>", methods=["DELETE"])
@admin_required
def admin_delete_product(pid):
    store.delete_product(pid)
    return "", 204

# Admin Categories CRUD
@app.route("/api/admin/categories", methods=["GET"])
@admin_required
def admin_list_categories():
    return jsonify(store.get_categories(visible_only=False))

@app.route("/api/admin/categories", methods=["POST"])
@admin_required
def admin_save_category():
    data = request.get_json() or {}
    saved = store.save_category(data)
    return jsonify(saved), 201

@app.route("/api/admin/categories/<int:cid>", methods=["DELETE"])
@admin_required
def admin_delete_category(cid):
    ok, msg = store.delete_category(cid)
    if not ok:
        return jsonify({"error": {"code": "conflict", "message": msg}}), 409
    return "", 204

# Admin Moderation
@app.route("/api/admin/comments", methods=["GET"])
@admin_required
def admin_all_comments():
    raw = store._read_json("comments.json", [])
    return jsonify(raw)

@app.route("/api/admin/comments/<int:cid>/moderate", methods=["POST"])
@admin_required
def admin_moderate_comment(cid):
    data = request.get_json() or {}
    action = data.get("action")
    reply = data.get("reply")
    ok = store.moderate_comment(cid, action, reply)
    return jsonify({"success": ok})

@app.route("/api/admin/reviews", methods=["GET"])
@admin_required
def admin_all_reviews():
    raw = store._read_json("reviews.json", [])
    return jsonify(raw)

@app.route("/api/admin/reviews/<int:rid>/moderate", methods=["POST"])
@admin_required
def admin_moderate_review(rid):
    data = request.get_json() or {}
    action = data.get("action")
    reply = data.get("reply")
    ok = store.moderate_review(rid, action, reply)
    return jsonify({"success": ok})

# Admin Inbox
@app.route("/api/admin/inbox", methods=["GET"])
@admin_required
def admin_inbox():
    return jsonify(store.get_contact_messages())

@app.route("/api/admin/inbox/<int:mid>", methods=["PATCH"])
@admin_required
def admin_update_inbox(mid):
    data = request.get_json() or {}
    msg = store.update_contact_message(mid, status=data.get("status"), note=data.get("internal_note"))
    return jsonify(msg or {})

# Admin Audit & Backup
@app.route("/api/admin/audit", methods=["GET"])
@admin_required
def admin_audit():
    return jsonify(store.get_audit_log(100))

@app.route("/api/admin/export", methods=["GET"])
@admin_required
def admin_export():
    return jsonify(store.export_all())

@app.route("/api/admin/import", methods=["POST"])
@admin_required
def admin_import():
    data = request.get_json() or {}
    store.import_all(data)
    return jsonify({"success": True})

# ------------------------------------------------------------------------------
# RSS Feed, Sitemap, and Robots.txt
# ------------------------------------------------------------------------------
@app.route("/feed.xml")
def rss_feed():
    posts_resp = store.get_posts(status="published", limit=30)
    settings = store.get_settings()
    site_name = settings.get("site_name", "Affiliate & Content Hub")
    tagline = settings.get("tagline", "Curated content")

    root = ET.Element("rss", version="2.0")
    channel = ET.SubElement(root, "channel")
    ET.SubElement(channel, "title").text = site_name
    ET.SubElement(channel, "description").text = tagline
    ET.SubElement(channel, "link").text = request.host_url

    for p in posts_resp["posts"]:
        item = ET.SubElement(channel, "item")
        ET.SubElement(item, "title").text = p.get("title", "Post")
        ET.SubElement(item, "description").text = p.get("excerpt", "")
        ET.SubElement(item, "link").text = request.host_url + "#post-" + p.get("slug", "")
        ET.SubElement(item, "pubDate").text = p.get("published_at", "")

    xml_bytes = ET.tostring(root, encoding="utf-8")
    return Response(xml_bytes, mimetype="application/xml")

@app.route("/sitemap.xml")
def sitemap():
    prods = store.get_products(status="published", limit=500)["products"]
    posts = store.get_posts(status="published", limit=500)["posts"]

    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    lines.append("  <url><loc>" + request.host_url + "</loc><changefreq>daily</changefreq></url>")
    lines.append("  <url><loc>" + request.host_url + "product</loc><changefreq>daily</changefreq></url>")
    for p in posts:
        lines.append("  <url><loc>" + request.host_url + "#post-" + p.get("slug", "") + "</loc></url>")
    for pr in prods:
        lines.append("  <url><loc>" + request.host_url + "product#product-" + pr.get("slug", "") + "</loc></url>")
    lines.append("</urlset>")
    return Response("\n".join(lines), mimetype="application/xml")

@app.route("/robots.txt")
def robots():
    content = "User-agent: *\nDisallow: /admin\nDisallow: /go/\nSitemap: " + request.host_url + "sitemap.xml\n"
    return Response(content, mimetype="text/plain")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=True)
