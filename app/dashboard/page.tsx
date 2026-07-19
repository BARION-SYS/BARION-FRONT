import { DollarSign, CalendarCheck, Users, Scissors, TrendingUp, Clock } from "lucide-react"
import { KpiCard } from "@/components/trimly/kpi-card"
import { RevenueAreaChart, MonthlyBarChart } from "@/components/trimly/revenue-chart"
import { AppointmentsToday } from "@/components/trimly/appointments-today"
import { BarberPerformance, ServiceDistribution } from "@/components/trimly/barber-performance"

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* KPI Grid */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            title="Ingresos hoy"
            value="$2,480"
            change="+18% vs ayer"
            changeType="up"
            icon={DollarSign}
            accent
          />
          <KpiCard
            title="Citas hoy"
            value="24"
            change="+3 vs ayer"
            changeType="up"
            icon={CalendarCheck}
            subtitle="3 canceladas"
          />
          <KpiCard
            title="Clientes nuevos"
            value="8"
            change="+2 esta semana"
            changeType="up"
            icon={Users}
            subtitle="Registros QR"
          />
          <KpiCard
            title="Barberos activos"
            value="3/3"
            icon={Scissors}
            subtitle="Todos disponibles"
          />
          <KpiCard
            title="Ticket promedio"
            value="$103"
            change="+$8 vs sem. ant."
            changeType="up"
            icon={TrendingUp}
          />
          <KpiCard
            title="Próxima cita"
            value="11:00"
            icon={Clock}
            subtitle="Roberto Silva"
          />
        </div>
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RevenueAreaChart />
        </div>
        <div>
          <MonthlyBarChart />
        </div>
      </section>

      {/* Bottom row */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <AppointmentsToday />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          <BarberPerformance />
          <ServiceDistribution />
        </div>
      </section>
    </main>
  )
}
