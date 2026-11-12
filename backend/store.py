"""
store.py — Lightweight JSON file persistence layer.

# Architecture & Scalability Note:
All persistent data is safely synchronized through JSON files in backend/data/.
To scale to SQLite or PostgreSQL later, swap the implementations in this file:
the rest of the application interacts exclusively through these function contracts.
"""

import os
import json
import uuid
import hashlib
import threading
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
LOCK = threading.Lock()

def _ensure_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)

def _read_json(filename, default_val):
    _ensure_dir()
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        _write_json(filename, default_val)
        return default_val
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default_val

def _write_json(filename, data):
    _ensure_dir()
    filepath = os.path.join(DATA_DIR, filename)
    temp_path = filepath + ".tmp"
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(temp_path, filepath)

def hash_token(token: str) -> str:
    """Computes SHA-256 hash for browser-stored edit tokens."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

# ------------------------------------------------------------------------------
# Settings
# ------------------------------------------------------------------------------
def get_settings():
    with LOCK:
        return _read_json("settings.json", {})

def update_settings(updates):
    with LOCK:
        curr = _read_json("settings.json", {})
        curr.update(updates)
        _write_json("settings.json", curr)
        log_audit("update_settings", "settings", "global", "Updated site settings")
        return curr

# ------------------------------------------------------------------------------
# Categories
# ------------------------------------------------------------------------------
def get_categories(visible_only=True):
    with LOCK:
        cats = _read_json("categories.json", [])
        if visible_only:
            return [c for c in cats if c.get("is_visible", True)]
        return cats

def save_category(cat_data):
    with LOCK:
        cats = _read_json("categories.json", [])
        cat_id = cat_data.get("id")
        if cat_id:
            for i, c in enumerate(cats):
                if c["id"] == cat_id:
                    cats[i] = cat_data
                    _write_json("categories.json", cats)
                    log_audit("update_category", "category", str(cat_id), "Updated category " + cat_data.get("name", ""))
                    return cats[i]
        new_id = max([c["id"] for c in cats], default=0) + 1
        cat_data["id"] = new_id
        cats.append(cat_data)
        _write_json("categories.json", cats)
        log_audit("create_category", "category", str(new_id), "Created category " + cat_data.get("name", ""))
        return cat_data

def delete_category(cat_id):
    with LOCK:
        products = _read_json("products.json", [])
        has_prods = any(p.get("category_id") == cat_id or p.get("subcategory_id") == cat_id for p in products)
        if has_prods:
            return False, "Cannot delete category that still contains products."
        cats = _read_json("categories.json", [])
        new_cats = [c for c in cats if c["id"] != cat_id and c.get("parent_id") != cat_id]
        _write_json("categories.json", new_cats)
        log_audit("delete_category", "category", str(cat_id), "Deleted category")
        return True, "Deleted successfully."

# ------------------------------------------------------------------------------
# Products
# ------------------------------------------------------------------------------
def get_products(category=None, subcategory=None, availability=None, platform=None,
                 brand=None, min_rating=None, sort="newest", query=None,
                 status="published", limit=24, offset=0):
    with LOCK:
        prods = _read_json("products.json", [])

    # Filter by status
    if status:
        prods = [p for p in prods if p.get("status") == status]

    # Filter category / subcategory
    if category:
        prods = [p for p in prods if p.get("category_slug") == category or str(p.get("category_id")) == str(category)]
    if subcategory:
        prods = [p for p in prods if p.get("subcategory_slug") == subcategory or str(p.get("subcategory_id")) == str(subcategory)]

    # Availability
    if availability and availability != "all":
        prods = [p for p in prods if p.get("availability") == availability]

    # Brand
    if brand:
        prods = [p for p in prods if p.get("brand", "").lower() == brand.lower()]

    # Platform (check offers)
    if platform:
        prods = [p for p in prods if any(o.get("platform", "").lower() == platform.lower() for o in p.get("offers", []))]

    # Min rating
    if min_rating is not None:
        try:
            mr = float(min_rating)
            prods = [p for p in prods if float(p.get("rating_avg", 0)) >= mr]
        except ValueError:
            pass

    # Query search
    if query:
        q = query.strip().lower()
        def matches(p):
            haystack = (p.get("name", "") + " " + p.get("brand", "") + " " +
                        p.get("summary", "") + " " + " ".join(p.get("tags", []))).lower()
            return q in haystack
        prods = [p for p in prods if matches(p)]

    # Sort
    if sort == "price_asc":
        prods.sort(key=lambda p: (p.get("price_minor") or 999999999))
    elif sort == "price_desc":
        prods.sort(key=lambda p: (p.get("price_minor") or 0), reverse=True)
    elif sort == "top_rated":
        prods.sort(key=lambda p: (p.get("rating_avg") or 0, p.get("rating_count") or 0), reverse=True)
    elif sort == "popular":
        prods.sort(key=lambda p: p.get("click_count", 0), reverse=True)
    elif sort == "name_asc":
        prods.sort(key=lambda p: p.get("name", "").lower())
    else: # newest
        prods.sort(key=lambda p: p.get("id", 0), reverse=True)

    total = len(prods)
    sliced = prods[offset:offset + limit] if limit else prods[offset:]
    return {
        "products": sliced,
        "total": total,
        "offset": offset,
        "limit": limit
    }

def get_product_by_slug(slug):
    with LOCK:
        prods = _read_json("products.json", [])
        for p in prods:
            if p.get("slug") == slug:
                return p
        return None

def save_product(data):
    with LOCK:
        prods = _read_json("products.json", [])
        pid = data.get("id")

        settings = _read_json("settings.json", {})
        default_currency = settings.get("default_currency", "USD")

        if pid:
            for i, p in enumerate(prods):
                if p["id"] == pid:
                    prods[i].update(data)
                    prods[i]["currency"] = data.get("currency", default_currency)
                    prods[i]["images"] = data.get("images", [])
                    prods[i]["options"] = data.get("options", {})
                    _write_json("products.json", prods)
                    log_audit("update_product", "product", str(pid), "Updated product " + data.get("name", ""))
                    return prods[i]

        new_id = max([p["id"] for p in prods], default=0) + 1
        data["id"] = new_id
        if "slug" not in data or not data["slug"]:
            data["slug"] = (data.get("name", "prod") + "-" + str(new_id)).lower().replace(" ", "-")
        data.setdefault("rating_avg", 0.0)
        data.setdefault("rating_count", 0)
        data.setdefault("click_count", 0)
        data["currency"] = data.get("currency", default_currency)
        data["images"] = data.get("images", [])
        data["options"] = data.get("options", {})
        prods.append(data)
        _write_json("products.json", prods)
        log_audit("create_product", "product", str(new_id), "Created product " + data.get("name", ""))
        return data

def delete_product(pid):
    with LOCK:
        prods = _read_json("products.json", [])
        new_prods = [p for p in prods if p["id"] != pid]
        _write_json("products.json", new_prods)
        log_audit("delete_product", "product", str(pid), "Deleted product")
        return True

def increment_click_count(slug, offer_id=None):
    with LOCK:
        prods = _read_json("products.json", [])
        target_url = None
        for p in prods:
            if p.get("slug") == slug:
                p["click_count"] = p.get("click_count", 0) + 1
                offers = p.get("offers", [])
                if offer_id:
                    for o in offers:
                        if str(o.get("id")) == str(offer_id):
                            target_url = o.get("url")
                            break
                if not target_url and offers:
                    primary = next((o for o in offers if o.get("is_primary")), offers[0])
                    target_url = primary.get("url")
                _write_json("products.json", prods)
                break
        return target_url

# ------------------------------------------------------------------------------
# Posts
# ------------------------------------------------------------------------------
def get_posts(post_type=None, tag=None, status="published", limit=12, offset=0):
    with LOCK:
        posts = _read_json("posts.json", [])

    if status:
        posts = [p for p in posts if p.get("status") == status]
    if post_type and post_type != "all":
        posts = [p for p in posts if p.get("type") == post_type]
    if tag:
        posts = [p for p in posts if tag.lower() in [t.lower() for t in p.get("tags", [])]]

    # Sort pinned first, then newest
    posts.sort(key=lambda p: (1 if p.get("pinned") else 0, p.get("id", 0)), reverse=True)

    total = len(posts)
    sliced = posts[offset:offset + limit] if limit else posts[offset:]
    return {
        "posts": sliced,
        "total": total,
        "offset": offset,
        "limit": limit
    }

def get_post_by_slug(slug):
    with LOCK:
        posts = _read_json("posts.json", [])
        for p in posts:
            if p.get("slug") == slug:
                return p
        return None

def save_post(data):
    with LOCK:
        posts = _read_json("posts.json", [])
        pid = data.get("id")
        if pid:
            for i, p in enumerate(posts):
                if p["id"] == pid:
                    posts[i].update(data)
                    _write_json("posts.json", posts)
                    log_audit("update_post", "post", str(pid), "Updated post " + data.get("title", ""))
                    return posts[i]
        new_id = max([p["id"] for p in posts], default=0) + 1
        data["id"] = new_id
        if "slug" not in data or not data["slug"]:
            data["slug"] = (data.get("title", "post") + "-" + str(new_id)).lower().replace(" ", "-")
        data.setdefault("created_at", datetime.utcnow().isoformat() + "Z")
        posts.append(data)
        _write_json("posts.json", posts)
        log_audit("create_post", "post", str(new_id), "Created post " + data.get("title", ""))
        return data

def delete_post(pid):
    with LOCK:
        posts = _read_json("posts.json", [])
        new_posts = [p for p in posts if p["id"] != pid]
        _write_json("posts.json", new_posts)
        log_audit("delete_post", "post", str(pid), "Deleted post")
        return True

# ------------------------------------------------------------------------------
# Reviews
# ------------------------------------------------------------------------------
def get_reviews(product_slug, include_pending=False):
    with LOCK:
        revs = _read_json("reviews.json", [])
        filtered = [r for r in revs if r.get("product_slug") == product_slug]
        if not include_pending:
            filtered = [r for r in filtered if r.get("status") == "published"]
        # Do not expose edit_token_hash in public view
        safe_list = []
        for r in filtered:
            item = dict(r)
            item.pop("edit_token_hash", None)
            safe_list.append(item)
        return safe_list

def add_review(product_slug, author_name, rating, title, body, status="published"):
    edit_token = str(uuid.uuid4()).replace("-", "")
    with LOCK:
        revs = _read_json("reviews.json", [])
        new_id = max([r.get("id", 0) for r in revs], default=0) + 1
        rev = {
            "id": new_id,
            "public_id": "rev-" + str(new_id) + "-" + str(uuid.uuid4())[:8],
            "product_slug": product_slug,
            "author_name": author_name.strip(),
            "rating": int(rating),
            "title": title.strip() if title else "",
            "body": body.strip(),
            "status": status,
            "owner_reply": None,
            "edit_token_hash": hash_token(edit_token),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "edited_at": None
        }
        revs.append(rev)
        _write_json("reviews.json", revs)
        _recompute_product_rating(product_slug, revs)
    return rev, edit_token

def edit_review(public_id, edit_token, new_body, new_rating=None, new_title=None):
    hashed = hash_token(edit_token)
    with LOCK:
        revs = _read_json("reviews.json", [])
        for r in revs:
            if r.get("public_id") == public_id:
                if r.get("edit_token_hash") != hashed:
                    return None, "Invalid edit token"
                r["body"] = new_body.strip()
                if new_rating:
                    r["rating"] = int(new_rating)
                if new_title is not None:
                    r["title"] = new_title.strip()
                r["edited_at"] = datetime.utcnow().isoformat() + "Z"
                _write_json("reviews.json", revs)
                _recompute_product_rating(r.get("product_slug"), revs)
                return r, None
        return None, "Review not found"

def delete_review(public_id, edit_token):
    hashed = hash_token(edit_token)
    with LOCK:
        revs = _read_json("reviews.json", [])
        prod_slug = None
        for i, r in enumerate(revs):
            if r.get("public_id") == public_id:
                if r.get("edit_token_hash") != hashed:
                    return False, "Invalid edit token"
                prod_slug = r.get("product_slug")
                revs.pop(i)
                _write_json("reviews.json", revs)
                if prod_slug:
                    _recompute_product_rating(prod_slug, revs)
                return True, None
        return False, "Review not found"

def moderate_review(review_id, action, owner_reply=None):
    with LOCK:
        revs = _read_json("reviews.json", [])
        prod_slug = None
        for r in revs:
            if r.get("id") == review_id:
                prod_slug = r.get("product_slug")
                if action == "approve":
                    r["status"] = "published"
                elif action == "hide":
                    r["status"] = "hidden"
                elif action == "spam":
                    r["status"] = "spam"
                elif action == "reply":
                    r["owner_reply"] = owner_reply
                _write_json("reviews.json", revs)
                if prod_slug:
                    _recompute_product_rating(prod_slug, revs)
                log_audit("moderate_review", "review", str(review_id), "Action: " + action)
                return True
        return False

def _recompute_product_rating(product_slug, revs):
    matching = [r for r in revs if r.get("product_slug") == product_slug and r.get("status") == "published"]
    count = len(matching)
    avg = round(sum(r["rating"] for r in matching) / count, 1) if count > 0 else 0.0
    prods = _read_json("products.json", [])
    for p in prods:
        if p.get("slug") == product_slug:
            p["rating_count"] = count
            p["rating_avg"] = avg
            break
    _write_json("products.json", prods)

# ------------------------------------------------------------------------------
# Comments
# ------------------------------------------------------------------------------
def get_comments(post_slug, include_pending=False):
    with LOCK:
        comms = _read_json("comments.json", [])
        filtered = [c for c in comms if c.get("post_slug") == post_slug]
        if not include_pending:
            filtered = [c for c in filtered if c.get("status") == "published"]
        safe_list = []
        for c in filtered:
            item = dict(c)
            item.pop("edit_token_hash", None)
            safe_list.append(item)
        return safe_list

def add_comment(post_slug, author_name, body, parent_id=None, is_owner=False, status="published"):
    edit_token = str(uuid.uuid4()).replace("-", "")
    with LOCK:
        comms = _read_json("comments.json", [])
        new_id = max([c.get("id", 0) for c in comms], default=0) + 1
        comm = {
            "id": new_id,
            "public_id": "com-" + str(new_id) + "-" + str(uuid.uuid4())[:8],
            "post_slug": post_slug,
            "parent_id": int(parent_id) if parent_id else None,
            "author_name": author_name.strip(),
            "body": body.strip(),
            "is_owner": is_owner,
            "status": status,
            "edit_token_hash": hash_token(edit_token),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "edited_at": None
        }
        comms.append(comm)
        _write_json("comments.json", comms)
    return comm, edit_token

def edit_comment(public_id, edit_token, new_body):
    hashed = hash_token(edit_token)
    with LOCK:
        comms = _read_json("comments.json", [])
        for c in comms:
            if c.get("public_id") == public_id:
                if c.get("edit_token_hash") != hashed:
                    return None, "Invalid edit token"
                c["body"] = new_body.strip()
                c["edited_at"] = datetime.utcnow().isoformat() + "Z"
                _write_json("comments.json", comms)
                return c, None
        return None, "Comment not found"

def delete_comment(public_id, edit_token):
    hashed = hash_token(edit_token)
    with LOCK:
        comms = _read_json("comments.json", [])
        for i, c in enumerate(comms):
            if c.get("public_id") == public_id:
                if c.get("edit_token_hash") != hashed:
                    return False, "Invalid edit token"
                # If has replies, mask as [deleted] to preserve thread structure
                has_replies = any(other.get("parent_id") == c["id"] for other in comms)
                if has_replies:
                    c["body"] = "[deleted]"
                    c["author_name"] = "[deleted]"
                    c["status"] = "published"
                else:
                    comms.pop(i)
                _write_json("comments.json", comms)
                return True, None
        return False, "Comment not found"

def moderate_comment(comment_id, action, owner_reply=None):
    with LOCK:
        comms = _read_json("comments.json", [])
        for c in comms:
            if c.get("id") == comment_id:
                if action == "approve":
                    c["status"] = "published"
                elif action == "hide":
                    c["status"] = "hidden"
                elif action == "spam":
                    c["status"] = "spam"
                elif action == "reply":
                    # Append direct reply from author
                    add_comment(c.get("post_slug"), "Author", owner_reply, parent_id=c["id"], is_owner=True, status="published")
                _write_json("comments.json", comms)
                log_audit("moderate_comment", "comment", str(comment_id), "Action: " + action)
                return True
        return False

# ------------------------------------------------------------------------------
# Contact Messages
# ------------------------------------------------------------------------------
def add_contact(category, name, email, subject, message, company="", website=""):
    with LOCK:
        msgs = _read_json("contact.json", [])
        new_id = max([m.get("id", 0) for m in msgs], default=0) + 1
        msg = {
            "id": new_id,
            "category": category,
            "name": name.strip(),
            "email": email.strip(),
            "subject": subject.strip(),
            "message": message.strip(),
            "company": company.strip() if company else "",
            "website": website.strip() if website else "",
            "status": "new",
            "internal_note": "",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        msgs.append(msg)
        _write_json("contact.json", msgs)
        log_audit("contact_submission", "contact", str(new_id), "Message from " + name)
        return msg

def get_contact_messages(category=None, status=None):
    with LOCK:
        msgs = _read_json("contact.json", [])
        if category:
            msgs = [m for m in msgs if m.get("category") == category]
        if status:
            msgs = [m for m in msgs if m.get("status") == status]
        msgs.sort(key=lambda m: m.get("id", 0), reverse=True)
        return msgs

def update_contact_message(msg_id, status=None, note=None):
    with LOCK:
        msgs = _read_json("contact.json", [])
        for m in msgs:
            if m.get("id") == msg_id:
                if status:
                    m["status"] = status
                if note is not None:
                    m["internal_note"] = note
                _write_json("contact.json", msgs)
                return m
        return None

# ------------------------------------------------------------------------------
# Audit & Overview
# ------------------------------------------------------------------------------
def log_audit(action, entity, entity_id, summary):
    try:
        msgs = _read_json("audit.json", [])
        new_id = max([a.get("id", 0) for a in msgs], default=0) + 1
        record = {
            "id": new_id,
            "at": datetime.utcnow().isoformat() + "Z",
            "actor": "admin",
            "action": action,
            "entity": entity,
            "entity_id": str(entity_id),
            "summary": summary
        }
        msgs.insert(0, record)
        if len(msgs) > 500:
            msgs = msgs[:500]
        _write_json("audit.json", msgs)
    except Exception:
        pass

def get_audit_log(limit=100):
    with LOCK:
        return _read_json("audit.json", [])[:limit]

def get_overview():
    with LOCK:
        comments = _read_json("comments.json", [])
        reviews = _read_json("reviews.json", [])
        contacts = _read_json("contact.json", [])
        products = _read_json("products.json", [])
        posts = _read_json("posts.json", [])

        pending_comments = sum(1 for c in comments if c.get("status") == "pending")
        pending_reviews = sum(1 for r in reviews if r.get("status") == "pending")
        new_messages = sum(1 for m in contacts if m.get("status") == "new")
        total_clicks = sum(p.get("click_count", 0) for p in products)

        top_products = sorted(products, key=lambda p: p.get("click_count", 0), reverse=True)[:5]
        top_posts = sorted(posts, key=lambda p: p.get("id", 0), reverse=True)[:5]

        return {
            "pending_comments": pending_comments,
            "pending_reviews": pending_reviews,
            "new_messages": new_messages,
            "total_clicks": total_clicks,
            "total_products": len(products),
            "total_posts": len(posts),
            "top_products": top_products,
            "top_posts": top_posts
        }

def export_all():
    with LOCK:
        return {
            "settings": _read_json("settings.json", {}),
            "categories": _read_json("categories.json", []),
            "products": _read_json("products.json", []),
            "posts": _read_json("posts.json", []),
            "reviews": _read_json("reviews.json", []),
            "comments": _read_json("comments.json", []),
            "contact": _read_json("contact.json", [])
        }

def import_all(data):
    with LOCK:
        for key in ["settings", "categories", "products", "posts", "reviews", "comments", "contact"]:
            if key in data:
                _write_json(key + ".json", data[key])
        log_audit("import_all", "database", "bulk", "Imported database backup")
        return True
