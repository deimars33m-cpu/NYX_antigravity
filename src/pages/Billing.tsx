import { useState } from "react";
import { DollarSign, Clock, Plus, TrendingUp, CreditCard } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import KpiCard from "@/components/KpiCard";

const kpis = [
  { title: "Facturado (Mes)", value: "€18,450", icon: DollarSign, accent: "hsl(142 70% 48%)", trend: { value: "12%", up: true } },
  { title: "Pendiente Cobro", value: "€7,200", icon: CreditCard, accent: "hsl(38 92% 55%)", trend: { value: "€1.2K", up: false } },
  { title: "Horas Registradas", value: "142h", icon: Clock, accent: "hsl(217 91% 60%)", trend: { value: "18%", up: true } },
  { title: "Ingresos Anuales", value: "€142K", icon: TrendingUp, accent: "hsl(271 77% 62%)", trend: { value: "22%", up: true } },
];

const invoices = [
  { id: "FAC-2024-031", client: "María García", amount: "€2,400", status: "Pagada", date: "1 Mar 2024", hours: 12 },
  { id: "FAC-2024-030", client: "TechCorp S.L.", amount: "€4,800", status: "Pendiente", date: "25 Feb 2024", hours: 24 },
  { id: "FAC-2024-029", client: "Jorge Pérez", amount: "€1,200", status: "Vencida", date: "10 Feb 2024", hours: 6 },
  { id: "FAC-2024-028", client: "Frutas del Norte", amount: "€3,600", status: "Pagada", date: "5 Feb 2024", hours: 18 },
  { id: "FAC-2024-027", client: "Sandra López", amount: "€960", status: "Pagada", date: "1 Feb 2024", hours: 8 },
];

const timeEntries = [
  { lawyer: "Ana Rodríguez", case: "EXP-2024-001", hours: 3.5, task: "Redacción demanda", date: "Hoy" },
  { lawyer: "Carlos López", case: "EXP-2024-002", hours: 2.0, task: "Preparación audiencia", date: "Hoy" },
  { lawyer: "María Torres", case: "EXP-2024-003", hours: 1.5, task: "Consulta cliente", date: "Ayer" },
  { lawyer: "Ana Rodríguez", case: "EXP-2024-005", hours: 4.0, task: "Revisión documentación", date: "Ayer" },
];

const statusStyle: Record<string, { color: string; bg: string }> = {
  Pagada:   { color: "hsl(142 70% 55%)", bg: "hsl(142 70% 48% / 0.15)" },
  Pendiente: { color: "hsl(38 92% 65%)",  bg: "hsl(38 92% 55% / 0.15)" },
  Vencida:  { color: "hsl(0 72% 65%)",   bg: "hsl(0 72% 55% / 0.15)" },
};

export default function Billing() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-display">Facturación & Tiempo</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Gestión de honorarios y registro de horas</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}><Clock size={16} />Registrar Horas</button>
          <button className="btn-primary flex items-center gap-2"><Plus size={16} />Nueva Factura</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => <KpiCard key={k.title} {...k} delay={i * 80} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Invoices */}
        <div className={`lg:col-span-2 ${isClassic ? "classic-container" : "glass-card rounded-xl"} p-5`}>
          <div className="section-header">
            <h3 className="text-sm font-semibold text-foreground">Facturas Recientes</h3>
            <button className="text-xs" style={{ color: "hsl(var(--primary))" }}>Ver todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  {["Nº Factura", "Cliente", "Importe", "Horas", "Estado", "Fecha"].map(h => (
                    <th key={h} className="pb-2 text-left font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.id} className="table-row-hover" style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
                    <td className="py-3 font-mono" style={{ color: "hsl(var(--primary))" }}>{inv.id}</td>
                    <td className="py-3 font-medium text-foreground">{inv.client}</td>
                    <td className="py-3 font-bold" style={{ color: "hsl(142 70% 55%)" }}>{inv.amount}</td>
                    <td className="py-3" style={{ color: "hsl(var(--muted-foreground))" }}>{inv.hours}h</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={statusStyle[inv.status]}>{inv.status}</span></td>
                    <td className="py-3" style={{ color: "hsl(var(--muted-foreground))" }}>{inv.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Time tracking */}
        <div className={`${isClassic ? "classic-container" : "glass-card rounded-xl"} p-5`}>
          <div className="section-header">
            <h3 className="text-sm font-semibold text-foreground">Horas Hoy</h3>
            <span className="text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>5.5h</span>
          </div>
          {timeEntries.map((e, i) => (
            <div key={i} className="flex gap-3 p-2 rounded-lg mb-2" style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.4)" }}>
              <div className="text-center shrink-0">
                <p className="text-lg font-bold font-display" style={{ color: "hsl(var(--primary))" }}>{e.hours}h</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{e.task}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{e.lawyer} · <span style={{ color: "hsl(var(--primary))" }}>{e.case}</span></p>
                <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{e.date}</p>
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 rounded-xl" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.05))", border: "1px solid hsl(var(--primary) / 0.2)" }}>
            <p className="text-xs font-semibold text-foreground mb-1">Tarifa media</p>
            <p className="text-xl font-bold font-display" style={{ color: "hsl(var(--primary))" }}>€180/h</p>
            <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Promedio del equipo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
