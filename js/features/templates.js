(function () {
  "use strict";

  var ICO = {
    sunrise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>',
    coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6a2 2 0 0 1 2 2v0H7v0a2 2 0 0 1 2-2z"/><path d="M17 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12l2 2 4-4"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="13" height="11" rx="1"/><path d="M14 9h4l3 3v5h-7V9z"/><circle cx="5.5" cy="19" r="2"/><circle cx="17.5" cy="19" r="2"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11"/><path d="M21 21l-1-1"/><path d="M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7"/><path d="M14 21l7-7"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  };
  App.tplIcons = ICO;

  App.builtInTemplates = [
    {
      id: "morning",
      name: "Morning Routine",
      desc: "Start the day right",
      icon: ICO.sunrise,
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
      icon: ICO.coffee,
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
      icon: ICO.moon,
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
      icon: ICO.scissors,
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
      icon: ICO.clipboard,
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
      icon: ICO.truck,
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
      icon: ICO.dumbbell,
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
      icon: ICO.briefcase,
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
      return { id: t.id, name: t.name, desc: "Custom template", icon: ICO.star, items: t.items, custom: true };
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
