// SidebarNativeDnD.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaImage,
  FaCogs,
  FaExchangeAlt,
  FaBox,
  FaTags,
  FaUsers,
  FaStar,
  FaCubes,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { IoSettingsSharp } from "react-icons/io5";

type SidebarProps = {
  navbarToogle: boolean;
  setNavbarToogle: (value: boolean) => void;
  userId?: string;
  allowCrossSectionMove?: boolean;
};

type NavItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
};

type NavSection = {
  id: string;
  title: string;
  items: NavItem[];
};

type PersistedState = {
  sectionsOrder: string[];
  itemsOrder: Record<string, string[]>;
};

type DragPayload =
  | { type: "section"; sectionId: string }
  | { type: "item"; sectionId: string; itemId: string };

const BRAND = { primary: "#DA4445" };

const STORAGE_KEY = (userId?: string) =>
  `admin_sidebar_order_${userId || "guest"}`;

function loadOrder(userId?: string): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveOrder(state: PersistedState, userId?: string) {
  try {
    localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(state));
  } catch {}
}

function applyOrder(base: NavSection[], order: PersistedState | null) {
  const map = new Map(base.map((s) => [s.id, s]));
  let sections: NavSection[] = [];

  if (order?.sectionsOrder?.length) {
    sections = order.sectionsOrder
      .map((id) => map.get(id))
      .filter(Boolean) as NavSection[];
    // add new sections
    for (const s of base) if (!order.sectionsOrder.includes(s.id)) sections.push(s);
  } else {
    sections = base;
  }

  if (order?.itemsOrder) {
    sections = sections.map((s) => {
      const ids = order.itemsOrder[s.id];
      if (!ids || !ids.length) return s;
      const itemMap = new Map(s.items.map((i) => [i.id, i]));
      const list: NavItem[] = [];
      for (const id of ids) {
        const it = itemMap.get(id);
        if (it) list.push(it);
      }
      for (const it of s.items) if (!ids.includes(it.id)) list.push(it);
      return { ...s, items: list };
    });
  }
  return sections;
}

const SidebarNativeDnD: React.FC<SidebarProps> = ({
  navbarToogle,
  setNavbarToogle,
  userId,
  allowCrossSectionMove = true,
}) => {
  const location = useLocation();

  const [width, setWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const isMobile = width <= 1023;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Base menu
  const baseMenu: NavSection[] = useMemo(
    () => [
      {
        id: "orders",
        title: "ORDERS",
        items: [
          { id: "orders-list", title: "Orders", icon: <FaBox />, path: "/orders/list" },
          { id: "orders-track", title: "Track Order", icon: <FaFileAlt />, path: "/orders/view" },
        ],
      },
      {
        id: "message",
        title: "MESSAGE",
        items: [{ id: "contacts", title: "Messages", icon: <FaMessage />, path: "/contacts" }],
      },
      {
        id: "products",
        title: "PRODUCTS",
        items: [
          { id: "product-add", title: "Add Product", icon: <FaBox />, path: "/product/add" },
          { id: "product-list", title: "Product List", icon: <FaFileAlt />, path: "/product/list" },
          { id: "product-view", title: "View Product", icon: <FaFileAlt />, path: "/product/view" },
        ],
      },
      {
        id: "banner",
        title: "BANNER",
        items: [{ id: "banner-view", title: "View Banner", icon: <FaTags />, path: "/banner" }],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        items: [{ id: "categories-view", title: "View Categories", icon: <FaTags />, path: "/categories" }],
      },
      {
        id: "coupons",
        title: "COUPONS",
        items: [{ id: "coupons-view", title: "View Coupons", icon: <FaTags />, path: "/coupons" }],
      },
      {
        id: "features",
        title: "FEATURES",
        items: [{ id: "features-view", title: "Features", icon: <FaStar />, path: "/features" }],
      },
      {
        id: "testimonials",
        title: "TESTIMONIALS",
        items: [{ id: "testimonials-view", title: "Testimonials", icon: <FaImage />, path: "/testimonials" }],
      },
      {
        id: "users",
        title: "USERS",
        items: [{ id: "users-list", title: "List Users", icon: <FaUsers />, path: "/users" }],
      },
      {
        id: "singles",
        title: "SINGLES",
        items: [{ id: "hero-product", title: "Hero Product", icon: <FaImage />, path: "/hero-product" }],
      },
      {
        id: "dynamic",
        title: "DYNAMIC PAGES",
        items: [{ id: "dynamic-pages", title: "Dynamic Pages", icon: <FaCubes />, path: "/dynamic-pages" }],
      },
      {
        id: "assets",
        title: "ASSETS",
        items: [{ id: "asset-manager", title: "Manage Assets", icon: <FaImage />, path: "/asset-manager" }],
      },
      {
        id: "settings",
        title: "SETTINGS",
        items: [
          { id: "roles", title: "Roles", icon: <FaCogs />, path: "/roles" },
          { id: "web-config", title: "Web Config", icon: <IoSettingsSharp />, path: "/web-config" },
          { id: "logout", title: "Logout", icon: <FaExchangeAlt />, path: "/logout" },
        ],
      },
    ],
    []
  );

  const persisted = loadOrder(userId);
  const [sections, setSections] = useState<NavSection[]>(
    applyOrder(baseMenu, persisted)
  );

  // Expanded toggles
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const allOpen = sections.reduce((acc, s) => {
      acc[s.title] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpanded(allOpen);
  }, [sections]);

  const toggle = (title: string) => {
    setExpanded((p) => ({ ...p, [title]: !p[title] }));
  };

  function persist(newSections: NavSection[]) {
    setSections(newSections);
    saveOrder(
      {
        sectionsOrder: newSections.map((s) => s.id),
        itemsOrder: newSections.reduce((acc, s) => {
          acc[s.id] = s.items.map((i) => i.id);
          return acc;
        }, {} as Record<string, string[]>),
      },
      userId
    );
  }

  // Native DnD payload
  function onDragStart(e: React.DragEvent, payload: DragPayload) {
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    // Use move cursor
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
  }

  function dropOnSection(e: React.DragEvent, targetSectionId: string, position?: "before"|"after") {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json")) as DragPayload;
      const current = [...sections];

      if (data.type === "section") {
        // reorder sections
        const fromIdx = current.findIndex((s) => s.id === data.sectionId);
        const toIdx = current.findIndex((s) => s.id === targetSectionId);
        if (fromIdx < 0 || toIdx < 0) return;

        // If dropping on header area, we just place "before" or "after".
        let insertIdx = toIdx;
        if (position === "after") insertIdx = toIdx + 1;
        const [moved] = current.splice(fromIdx, 1);
        const finalIdx = fromIdx < insertIdx ? insertIdx - 1 : insertIdx;
        current.splice(finalIdx, 0, moved);
        persist(current);
      }

      if (data.type === "item") {
        // move item into top/bottom of a section (if desired). For now, we'll place at end.
        if (!allowCrossSectionMove) return;
        const srcIdx = current.findIndex((s) => s.id === data.sectionId);
        const dstIdx = current.findIndex((s) => s.id === targetSectionId);
        if (srcIdx < 0 || dstIdx < 0) return;

        const srcItems = [...current[srcIdx].items];
        const movingIndex = srcItems.findIndex((i) => i.id === data.itemId);
        if (movingIndex < 0) return;
        const [moving] = srcItems.splice(movingIndex, 1);

        const dstItems = [...current[dstIdx].items];
        // insert at end; customize for position if you want
        dstItems.push(moving);

        current[srcIdx] = { ...current[srcIdx], items: srcItems };
        current[dstIdx] = { ...current[dstIdx], items: dstItems };
        persist(current);
      }
    } catch {}
  }

  function dropOnItem(
    e: React.DragEvent,
    sectionId: string,
    targetItemId: string,
    position?: "before" | "after"
  ) {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json")) as DragPayload;
      const current = [...sections];

      if (data.type === "item") {
        const srcIdx = current.findIndex((s) => s.id === data.sectionId);
        const dstIdx = current.findIndex((s) => s.id === sectionId);
        if (srcIdx < 0 || dstIdx < 0) return;

        const srcItems = [...current[srcIdx].items];
        const movingIndex = srcItems.findIndex((i) => i.id === data.itemId);
        if (movingIndex < 0) return;
        const [moving] = srcItems.splice(movingIndex, 1);

        const dstItems = [...current[dstIdx].items];
        const dropIdx = dstItems.findIndex((i) => i.id === targetItemId);
        if (dropIdx < 0) return;

        let insertIdx = dropIdx;
        if (position === "after") insertIdx = dropIdx + 1;

        // if same list and fromIndex < toIndex, adjust
        const sameList = srcIdx === dstIdx;
        if (sameList && movingIndex < insertIdx) insertIdx--;

        dstItems.splice(insertIdx, 0, moving);

        current[srcIdx] = { ...current[srcIdx], items: srcItems };
        current[dstIdx] = { ...current[dstIdx], items: dstItems };
        persist(current);
      }

      if (data.type === "section") {
        // optional: allow dropping a section around an item to reorder sections; skip for clarity
      }
    } catch {}
  }

  const isOpen = !navbarToogle || !isMobile;

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setNavbarToogle(true)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed z-50 top-0 left-0 h-screen w-[260px] bg-gray-900 text-white border-r border-gray-800 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <img
              src="https://gjn.vercel.app/assets/favicon/favicon.png"
              alt="Admin"
              className="h-10 w-10 object-contain"
            /> */}
            <div>
              <h1 className="text-base font-semibold text-white leading-tight">
                Admin
              </h1>
              <p className="text-xs text-gray-400">Control Panel</p>
            </div>
          </div>
          {isMobile && (
            <button
              className="p-2 rounded-md border border-gray-700 hover:bg-gray-800"
              onClick={() => setNavbarToogle(true)}
              aria-label="Close Sidebar"
            >
              <IoMdClose size={18} />
            </button>
          )}
        </div>

        {/* Reset */}
        <div className="px-2 py-2">
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY(userId));
              setSections(baseMenu);
            }}
            className="mx-1 my-2 px-3 py-1.5 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 text-xs"
          >
            Reset Sidebar
          </button>
        </div>

        {/* Body */}
        <nav className="px-2 pb-3 overflow-y-auto h-[calc(100vh-5.5rem)] scrollbar scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pb-10 ">
          {/* Dashboard */}
          <Link
            to="/"
            className={`group mb-2 flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
              location.pathname === "/"
                ? "bg-gray-800 border-l-4"
                : "hover:bg-gray-800/60"
            }`}
            style={location.pathname === "/" ? { borderLeftColor: BRAND.primary } : {}}
            aria-current={location.pathname === "/" ? "page" : undefined}
          >
            <FaTachometerAlt className="text-gray-300 group-hover:text-white" />
            <span className="text-sm text-gray-200 group-hover:text-white">Dashboard</span>
          </Link>

          {/* Sections */}
          {sections.map((section, sIdx) => {
            const isExpanded = !!expanded[section.title];

            return (
              <div key={section.id} className="mb-3">
                {/* Section drag area: header is draggable */}
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, { type: "section", sectionId: section.id })}
                  onDragOver={onDragOver}
                  onDrop={(e) => dropOnSection(e, section.id, "before")}
                  className="rounded-md"
                  title="Drag to reorder section"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 text-[11px] tracking-wide text-gray-400 hover:text-gray-200 uppercase"
                    onClick={() => toggle(section.title)}
                    aria-expanded={isExpanded}
                    aria-controls={`section-${section.title}`}
                  >
                    <span>{section.title}</span>
                    {isExpanded ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
                  </button>
                </div>

                {/* Drop after section (to allow placing below) */}
                <div
                  onDragOver={onDragOver}
                  onDrop={(e) => dropOnSection(e, section.id, "after")}
                  className="h-1"
                />

                {/* Items */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`section-${section.title}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {section.items.map((item, iIdx) => {
                        const active = location.pathname === item.path;
                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) =>
                              onDragStart(e, {
                                type: "item",
                                sectionId: section.id,
                                itemId: item.id,
                              })
                            }
                            onDragOver={onDragOver}
                            onDrop={(e) => dropOnItem(e, section.id, item.id, "before")}
                            title="Drag to reorder"
                          >
                            <Link
                              to={item.path}
                              className={`group flex items-center gap-3 py-2 px-4 rounded-lg transition-colors ${
                                active ? "bg-gray-800 border-l-4" : "hover:bg-gray-800/60"
                              }`}
                              style={active ? { borderLeftColor: BRAND.primary } : {}}
                              aria-current={active ? "page" : undefined}
                            >
                              <span
                                className={`text-gray-400 group-hover:text-white ${
                                  active ? "text-white" : ""
                                }`}
                              >
                                {item.icon}
                              </span>
                              <span
                                className={`text-sm ${
                                  active ? "text-white" : "text-gray-300 group-hover:text-white"
                                }`}
                              >
                                {item.title}
                              </span>
                            </Link>

                            {/* Drop after this item */}
                            <div
                              onDragOver={onDragOver}
                              onDrop={(e) => dropOnItem(e, section.id, item.id, "after")}
                              className="h-1"
                            />
                          </div>
                        );
                      })}

                      {/* Allow dropping items into empty section end */}
                      <div
                        onDragOver={onDragOver}
                        onDrop={(e) => dropOnSection(e, section.id, "after")}
                        className="h-2"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default SidebarNativeDnD;
