"use client";

import { useWizard } from "@/context/WizardContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventRow } from "@/types/wizard";
import { Activity, Plus, Trash2 } from "lucide-react";

export default function StepEvents() {
  const { state, dispatch } = useWizard();
  const { eventTracking } = state;

  const update = (payload: Partial<typeof eventTracking>) =>
    dispatch({ type: "SET_EVENT_TRACKING", payload });

  const updateEvent = (index: number, partial: Partial<EventRow>) => {
    const next = [...eventTracking.events];
    next[index] = { ...next[index], ...partial };
    update({ events: next });
  };

  const addEvent = () => {
    const id = String(Date.now());
    update({
      events: [
        ...eventTracking.events,
        { id, name: "", description: "", type: "custom" },
      ],
    });
  };

  const removeEvent = (index: number) => {
    update({ events: eventTracking.events.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rokt-beetroot/10 text-rokt-beetroot">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Event Tracking</h2>
          <p className="text-sm text-rokt-gray-800">
            Define the events to track in the integration guide.
          </p>
        </div>
      </div>

      {/* Event Summary Table */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Event Summary Table</Label>
        <div className="rounded-xl border border-rokt-gray-600 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Event Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[130px]">Type</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventTracking.events.map((evt, i) => (
                <TableRow key={evt.id}>
                  <TableCell>
                    <Input
                      className="h-8 text-sm font-mono"
                      value={evt.name}
                      onChange={(e) => updateEvent(i, { name: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 text-sm"
                      value={evt.description}
                      onChange={(e) =>
                        updateEvent(i, { description: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={evt.type}
                      onValueChange={(val) =>
                        updateEvent(i, {
                          type: val as EventRow["type"],
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page_view">Page View</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="commerce">Commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeEvent(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button variant="outline" size="sm" onClick={addEvent}>
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </Button>
      </div>

      {/* Code Example Configuration */}
      <div className="space-y-4 rounded-xl bg-rokt-gray-300 p-5">
        <Label className="text-sm font-medium">Code Example Settings</Label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Page View Example Page</Label>
            <Input
              className="h-8 text-sm"
              placeholder="confirmation_page"
              value={eventTracking.pageViewExample}
              onChange={(e) => update({ pageViewExample: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Custom Event Name</Label>
            <Input
              className="h-8 text-sm"
              placeholder="sign_in"
              value={eventTracking.customEventName}
              onChange={(e) => update({ customEventName: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-rokt-gray-600 bg-white p-3">
          <Label className="text-xs font-medium text-muted-foreground">
            Custom Event Attribute (key : value)
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              className="h-8 text-sm font-mono"
              placeholder="loyaltyTier"
              value={eventTracking.customEventAttribute.key}
              onChange={(e) =>
                update({
                  customEventAttribute: {
                    ...eventTracking.customEventAttribute,
                    key: e.target.value,
                  },
                })
              }
            />
            <Input
              className="h-8 text-sm font-mono"
              placeholder="Gold"
              value={eventTracking.customEventAttribute.value}
              onChange={(e) =>
                update({
                  customEventAttribute: {
                    ...eventTracking.customEventAttribute,
                    value: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-sm font-medium">Commerce Events</p>
            <p className="text-xs text-muted-foreground">
              Include a commerce event code example
            </p>
          </div>
          <Switch
            checked={eventTracking.commerceEnabled}
            onCheckedChange={(checked) => update({ commerceEnabled: checked })}
          />
        </div>

        {eventTracking.commerceEnabled && (
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Product Name</Label>
              <Input
                className="h-8 text-sm"
                value={eventTracking.commerceProduct.name}
                onChange={(e) =>
                  update({
                    commerceProduct: {
                      ...eventTracking.commerceProduct,
                      name: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">SKU</Label>
              <Input
                className="h-8 text-sm"
                value={eventTracking.commerceProduct.sku}
                onChange={(e) =>
                  update({
                    commerceProduct: {
                      ...eventTracking.commerceProduct,
                      sku: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Price</Label>
              <Input
                className="h-8 text-sm"
                value={eventTracking.commerceProduct.price}
                onChange={(e) =>
                  update({
                    commerceProduct: {
                      ...eventTracking.commerceProduct,
                      price: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Transaction Revenue</Label>
              <Input
                className="h-8 text-sm"
                value={eventTracking.commerceTransaction.revenue}
                onChange={(e) =>
                  update({
                    commerceTransaction: {
                      ...eventTracking.commerceTransaction,
                      revenue: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
