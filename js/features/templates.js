(function () {
  "use strict";

  App.builtInTemplates = [
    {
      id: "morning",
      name: "Morning Routine",
      desc: "Start the day right",
      icon: "☀️",
      items: [
        { text: "Drink a glass of water", priority: 2 },
        { text: "10 minutes stretch / walk", priority: 2 },
        { text: "Plan top 3 priorities for the day", priority: 3 },
        { text: "Inbox zero — quick scan", priority: 1 },
        { text: "Healthy breakfast", priority: 1 }
      ]
    },
    {
      id: "cafe-open",
      name: "Café Opening Checklist",
      desc: "Daily café shift open",
      icon: "☕",
      items: [
        { text: "Unlock & disarm alarm", priority: 3 },
        { text: "Turn on espresso machine, grinders, ovens", priority: 3 },
        { text: "Check fridge temperatures", priority: 3 },
        { text: "Wipe down counters & tables", priority: 2 },
        { text: "Stock pastries & display", priority: 2 },
        { text: "Float cash in till", priority: 3 },
        { text: "Sweep entrance & sidewalk", priority: 1 },
        { text: "Flip OPEN sign", priority: 2 }
      ]
    },
    {
      id: "cafe-close",
      name: "Café Closing Checklist",
      desc: "End-of-day shutdown",
      icon: "🌙",
      items: [
        { text: "Cash up & reconcile till", priority: 3 },
        { text: "Clean espresso machine & backflush", priority: 3 },
        { text: "Empty bins & take out trash", priority: 2 },
        { text: "Mop floors", priority: 2 },
        { text: "Restock for tomorrow morning", priority: 2 },
        { text: "Lock doors & set alarm", priority: 3 }
      ]
    },
    {
      id: "salon-client",
      name: "Salon Client Visit",
      desc: "Per-client checklist",
      icon: "💇",
      items: [
        { text: "Consultation & client preferences", priority: 3 },
        { text: "Before photo", priority: 2 },
        { text: "Wash & treatment", priority: 2 },
        { text: "Service performed", priority: 3 },
        { text: "After photo", priority: 2 },
        { text: "Booking next appointment", priority: 1 },
        { text: "Payment & receipt", priority: 3 }
      ]
    },
    {
      id: "property-inspection",
      name: "Property Inspection",
      desc: "Unit handover or check",
      icon: "🏠",
      items: [
        { text: "Photos of all rooms", priority: 3 },
        { text: "Check all electrical outlets & switches", priority: 2 },
        { text: "Test taps & water pressure", priority: 2 },
        { text: "AC working — all rooms", priority: 3 },
        { text: "Door locks & keys handed over", priority: 3 },
        { text: "Utility meter readings", priority: 3 },
        { text: "Sign inspection sheet", priority: 3 }
      ]
    },
    {
      id: "delivery",
      name: "Delivery Run",
      desc: "Driver pre-trip + drop-offs",
      icon: "🛵",
      items: [
        { text: "Vehicle check — fuel, tires, lights", priority: 3 },
        { text: "Load packages by route order", priority: 2 },
        { text: "Confirm route in maps", priority: 2 },
        { text: "Customer signature / proof of delivery", priority: 3 },
        { text: "Photo of delivered package", priority: 3 },
        { text: "Submit daily summary", priority: 2 }
      ]
    },
    {
      id: "workout",
      name: "Gym Session",
      desc: "Full-body workout",
      icon: "💪",
      items: [
        { text: "Warm-up — 5 min", priority: 2 },
        { text: "Compound lift — sets x reps", priority: 3 },
        { text: "Accessory work", priority: 2 },
        { text: "Cardio finisher", priority: 1 },
        { text: "Stretch & cool down", priority: 1 },
        { text: "Log workout", priority: 1 }
      ]
    },
    {
      id: "travel",
      name: "Travel Packing",
      desc: "Don't forget anything",
      icon: "🧳",
      items: [
        { text: "Passport & visa", priority: 3 },
        { text: "Tickets / boarding pass", priority: 3 },
        { text: "Phone, charger, power bank", priority: 3 },
        { text: "Wallet, cash, cards", priority: 3 },
        { text: "Clothes by day count", priority: 2 },
        { text: "Toiletries", priority: 2 },
        { text: "Medications", priority: 3 },
        { text: "Lock the house, set alarm", priority: 3 }
      ]
    }
  ];

  App.allTemplates = function () {
    var custom = (App.state.templates || []).map(function (t) {
      return { id: t.id, name: t.name, desc: "Custom template", icon: "⭐", items: t.items, custom: true };
    });
    return App.builtInTemplates.concat(custom);
  };

  App.applyTemplate = function (tplId) {
    var tpl = null;
    var all = App.allTemplates();
    for (var i = 0; i < all.length; i++) if (all[i].id === tplId) { tpl = all[i]; break; }
    if (!tpl) return 0;
    var added = 0;
    tpl.items.forEach(function (it) {
      var task = App.addTask(it.text, { priority: it.priority || 0 });
      if (task) added++;
    });
    App.toast(added + " task" + (added === 1 ? "" : "s") + " added");
    return added;
  };

  App.saveCurrentAsTemplate = function (name) {
    var tasks = App.activeTasks();
    if (!tasks.length) { App.toast("No tasks to save"); return null; }
    name = (name || "").trim();
    if (!name) return null;
    var tpl = {
      id: "tpl-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5),
      name: name,
      items: tasks.map(function (t) { return { text: t.text, priority: t.priority || 0 }; }),
      createdAt: new Date().toISOString()
    };
    if (!App.state.templates) App.state.templates = [];
    App.state.templates.push(tpl);
    App.save();
    App.toast("Template saved");
    return tpl.id;
  };

  App.deleteTemplate = function (id) {
    if (!App.state.templates) return;
    App.state.templates = App.state.templates.filter(function (t) { return t.id !== id; });
    App.save();
  };
})();
