import math
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "change-me-to-anything"   # needed for flash() messages

# ------------------------------------------------------------------
# EDIT YOUR PERSONAL INFO HERE (used by the Profile and Contact pages)
# ------------------------------------------------------------------
PROFILE = {
    "name": "Your Full Name",
    "nickname": "Cliff",
    "year_course": "BS Computer Engineering",
    "section": "2-3",
    "subject": "Data Structures and Algorithms",
    "motto": "What if I fall? Bro, what if u Fly!.",
    "about": "I love turning small pieces into big things, in code and in LEGO.",
    "hobbies": ["Coding", "Building LEGO", "Gaming"],
    "photo": "images/jerum.jpg",          # put your photo in static/images/
    "email": "cliffbradley730@gmail.com",
    "phone": "+63 962 433 5819",
    "location": "Maui Oasis, Sta Mesa, Manila",
    "github": "https://github.com/Shino505",
    "facebook": "https://facebook.com/your-username",
}


# ------------------------------------------------------------------
# Pages
# ------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html", p=PROFILE)


@app.route("/profile")
def profile():
    return render_template("profile.html", p=PROFILE)


@app.route("/contact")
def contact():
    return render_template("contact.html", p=PROFILE)


# ------------------------------------------------------------------
# Works
# ------------------------------------------------------------------
@app.route("/works")
def works():
    return render_template("works.html")


@app.route("/works/uppercase", methods=["GET", "POST"])
def uppercase():
    result = None
    if request.method == "POST":
        result = request.form.get("inputString", "").upper()
    return render_template("touppercase.html", result=result)


def to_number(text):
    """Return a positive float, or None if the input is invalid."""
    try:
        value = float(text)
        return value if value > 0 else None
    except (TypeError, ValueError):
        return None


@app.route("/works/area/circle", methods=["GET", "POST"])
def acircle():
    result = radius = error = None
    if request.method == "POST":
        radius = to_number(request.form.get("radius"))
        if radius is None:
            error = "Please enter a number greater than 0."
        else:
            result = round(math.pi * radius ** 2, 2)
    return render_template("circle.html", result=result, radius=radius, error=error)


@app.route("/works/area/triangle", methods=["GET", "POST"])
def atriangle():
    result = base = height = error = None
    if request.method == "POST":
        base = to_number(request.form.get("base"))
        height = to_number(request.form.get("height"))
        if base is None or height is None:
            error = "Base and height must be numbers greater than 0."
        else:
            result = round(0.5 * base * height, 2)
    return render_template("triangle.html", result=result, base=base,
                           height=height, error=error)


# ------------------------------------------------------------------
# Linked list (Lab item 5)
# ------------------------------------------------------------------
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None

    def insert_head(self, data):
        node = Node(data)
        node.next = self.head
        self.head = node

    def insert_tail(self, data):
        node = Node(data)
        if not self.head:
            self.head = node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node

    def delete(self, data):
        """Delete the first node holding `data`. Returns True if found."""
        cur, prev = self.head, None
        while cur:
            if cur.data == data:
                if prev:
                    prev.next = cur.next
                else:
                    self.head = cur.next
                return True
            prev, cur = cur, cur.next
        return False

    def search(self, data):
        """Return the position (0-based) of `data`, or -1."""
        cur, i = self.head, 0
        while cur:
            if cur.data == data:
                return i
            cur, i = cur.next, i + 1
        return -1

    def reverse(self):
        prev, cur = None, self.head
        while cur:
            cur.next, prev, cur = prev, cur, cur.next
        self.head = prev

    def clear(self):
        self.head = None

    def to_list(self):
        items, cur = [], self.head
        while cur:
            items.append(cur.data)
            cur = cur.next
        return items


my_list = LinkedList()
for starter in ("LEGO", "Flask", "Python"):
    my_list.insert_tail(starter)


@app.route("/works/linkedlist", methods=["GET", "POST"])
def linkedlist():
    found = request.args.get("found", type=int)
    if request.method == "POST":
        action = request.form.get("action")
        value = request.form.get("value", "").strip()
        needs_value = action in ("head", "tail", "delete", "search")

        if needs_value and not value:
            flash("Type a value first.", "error")
        elif action == "head":
            my_list.insert_head(value)
            flash(f"Added '{value}' to the front.", "ok")
        elif action == "tail":
            my_list.insert_tail(value)
            flash(f"Added '{value}' to the end.", "ok")
        elif action == "delete":
            if my_list.delete(value):
                flash(f"Removed '{value}'.", "ok")
            else:
                flash(f"'{value}' is not in the list.", "error")
        elif action == "search":
            pos = my_list.search(value)
            if pos == -1:
                flash(f"'{value}' is not in the list.", "error")
            else:
                flash(f"Found '{value}' at position {pos}.", "ok")
                return redirect(url_for("linkedlist", found=pos))
        elif action == "reverse":
            my_list.reverse()
            flash("List reversed.", "ok")
        elif action == "clear":
            my_list.clear()
            flash("List cleared.", "ok")
        return redirect(url_for("linkedlist"))

    return render_template("linkedlist.html", items=my_list.to_list(), found=found)


if __name__ == "__main__":
    app.run(debug=True)
