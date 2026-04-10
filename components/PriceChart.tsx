'use client'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'

interface DataPoint { time: string; yes: number }

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const yes = payload[0]?.value ?? 0
  return (
    <div style={{ background: '#161111', border: '1px solid #271818', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ fontSize: 10, color: '#5A4545', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#FA4E1D' }}>Yes {yes}%</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#C04040' }}>No {(100 - yes).toFixed(0)}%</p>
    </div>
  )
}

export default function PriceChart({ data, height = 180 }: { data: DataPoint[]; height?: number }) {
  if (!data?.length) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 11, color: '#5A4545' }}>No history yet</span>
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#FA4E1D" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#FA4E1D" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="#1D1515" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: '#5A4545', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis domain={[0, 100]} tick={{ fill: '#5A4545', fontSize: 9 }} tickLine={false} axisLine={false}
          tickFormatter={v => `${v}%`} ticks={[0, 25, 50, 75, 100]} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3D2828', strokeWidth: 1 }} />
        <Area type="monotone" dataKey="yes" stroke="#FA4E1D" strokeWidth={1.5}
          fill="url(#yesGrad)" dot={false}
          activeDot={{ r: 3, fill: '#FA4E1D', stroke: '#0E0B0B', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
