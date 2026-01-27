// src/components/PriceAlerts.tsx

"use client";

import { useState, useEffect } from "react";
import { Bell, Plus, X, TrendingUp, TrendingDown } from "lucide-react";

interface PriceAlert {
  id: string;
  targetPrice: number;
  condition: "above" | "below";
  currency: string;
  active: boolean;
  createdAt: string;
}

interface PriceAlertsProps {
  currentPrice: number;
  currency: string;
}

export default function PriceAlerts({ currentPrice, currency }: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Load alerts from localStorage
    const stored = localStorage.getItem("gold-price-alerts");
    if (stored) {
      setAlerts(JSON.parse(stored));
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Save alerts to localStorage
    if (alerts.length > 0) {
      localStorage.setItem("gold-price-alerts", JSON.stringify(alerts));
    }
  }, [alerts]);

  useEffect(() => {
    // Check alerts against current price
    if (currentPrice && alerts.length > 0) {
      alerts.forEach((alert) => {
        if (!alert.active || alert.currency !== currency) return;

        const shouldTrigger =
          (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
          (alert.condition === "below" && currentPrice <= alert.targetPrice);

        if (shouldTrigger) {
          triggerAlert(alert);
          // Deactivate the alert
          setAlerts((prev) =>
            prev.map((a) => (a.id === alert.id ? { ...a, active: false } : a))
          );
        }
      });
    }
  }, [currentPrice, alerts, currency]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const triggerAlert = (priceAlert: PriceAlert) => {
    if (notificationPermission === "granted") {
      new Notification("Gold Price Alert!", {
        body: `Gold price is now ${priceAlert.condition} ${priceAlert.targetPrice} ${priceAlert.currency}`,
        icon: "/favicon.ico",
        tag: priceAlert.id,
      });
    } else {
      alert("Gold Price Alert! Price is now " + priceAlert.condition + " " + priceAlert.targetPrice + " " + priceAlert.currency);
    }
  };

  const addAlert = () => {
    if (!targetPrice || isNaN(Number(targetPrice))) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      targetPrice: Number(targetPrice),
      condition,
      currency,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setAlerts([...alerts, newAlert]);
    setTargetPrice("");
    setShowForm(false);

    if (notificationPermission === "default") {
      requestNotificationPermission();
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const activeAlerts = alerts.filter((a) => a.active && a.currency === currency);
  const triggeredAlerts = alerts.filter((a) => !a.active && a.currency === currency);

  return (
    <div className="card-gold p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gradient-gold" />
          <h3 className="text-sm font-bold text-primary">Price Alerts</h3>
          {activeAlerts.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-gold text-white">
              {activeAlerts.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-2 py-1 rounded bg-secondary border border-secondary text-primary hover:border-gold-400 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {notificationPermission !== "granted" && (
        <div className="mb-3 p-2 bg-secondary rounded text-xs text-muted">
          <button
            onClick={requestNotificationPermission}
            className="underline hover:text-gradient-gold"
          >
            Enable notifications
          </button>{" "}
          to get alerts
        </div>
      )}

      {showForm && (
        <div className="mb-3 p-3 bg-secondary rounded-lg border border-secondary space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder={`Target price (${currency})`}
              className="flex-1 px-2 py-1 text-xs bg-transparent border border-secondary rounded text-primary focus:outline-none focus:border-gold-400"
            />
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as "above" | "below")}
              className="px-2 py-1 text-xs bg-transparent border border-secondary rounded text-primary focus:outline-none"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addAlert}
              className="flex-1 px-3 py-1 text-xs bg-gradient-gold text-white rounded hover:shadow-gold transition-shadow"
            >
              Add Alert
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-xs bg-secondary border border-secondary rounded text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {activeAlerts.length === 0 && !showForm && (
          <p className="text-xs text-muted text-center py-4">
            No active alerts. Click + to add one.
          </p>
        )}

        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-2 bg-secondary rounded border border-secondary"
          >
            <div className="flex items-center gap-2">
              {alert.condition === "above" ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <div>
                <p className="text-xs font-semibold text-primary">
                  {alert.condition === "above" ? "≥" : "≤"} {alert.targetPrice} {alert.currency}
                </p>
                <p className="text-xs text-muted">
                  Current: {currentPrice.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="text-muted hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {triggeredAlerts.length > 0 && (
          <div className="pt-2 border-t border-secondary">
            <p className="text-xs text-muted mb-2">Triggered</p>
            {triggeredAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-2 bg-secondary/50 rounded mb-1 opacity-60"
              >
                <p className="text-xs text-muted line-through">
                  {alert.condition === "above" ? "≥" : "≤"} {alert.targetPrice} {alert.currency}
                </p>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="text-muted hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
