import React from 'react';

const Badge = ({ children, variant = 'green' }: {children: any, variant: any}) => {
  const bg = variant === 'green' ? 'bg-green-100' : 'bg-blue-100';
  const text = variant === 'green' ? 'text-green-600' : 'text-blue-600';
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full ${bg}` }>
      <span className={`text-sm font-medium ${text}`}>{children}</span>
    </div>
  );
};

const ProgressBar = ({ percent = 75 }) => {
  // percent should be between 0 and 100
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative w-full h-4 bg-blue-50 rounded-lg border border-gray-200">
      <div
        className="absolute left-0 top-0 h-4 rounded-lg"
        style={{ width: `${clamped}%`, background: 'linear-gradient(90deg,#3B5CFF,#6F5CFF)' }}
      />
    </div>
  );
};

const Gauge = ({ percent = 60, size = 220 }) => {
  // Draw a semicircle arc using SVG. percent is 0-100.
  const radius = (size - 32) / 2; // leave padding for stroke
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -Math.PI; // left-most
  const endAngle = 0; // right-most
  const angle = (startAngle + (Math.PI * (percent / 100)));
  const x = cx + radius * Math.cos(angle);
  const y = cy + radius * Math.sin(angle);

  // Path for the background arc (semi circle)
  const largeArc = 0; // always less than 180 degrees for semicircle
  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);

  const arcPathBg = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  const arcPathProgress = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y}`;

  return (
    <svg width={size} height={size / 1.05} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* background arc */}
      <path d={arcPathBg} stroke="#EAF0FF" strokeWidth={18} strokeLinecap="round" fill="none" />
      {/* progress arc */}
      <path d={arcPathProgress} stroke="#3B5CFF" strokeWidth={18} strokeLinecap="round" fill="none" />
      {/* knob at end */}
      <circle cx={x} cy={y} r={12} fill="#3B5CFF" stroke="#fff" strokeWidth={4} />
    </svg>
  );
};

export function Billing() {
  // sample values that reflect the design
  const daysLeft = 10;
  const percentLeft = Math.round(((30 - daysLeft) / 30) * 100); // assume 30-day cycle

  return (
    <div className="max-w-[1110px] mx-auto mt-20 mb-10 font-inter text-gray-900">
      {/* Header row (title + active badge) */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Pro Tier</h2>
          <Badge variant="green">Active</Badge>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold">Cancel Subscription</button>
      </div>

      {/* Top summary cards: left progress card + right payment method card */}
      <div className="flex flex-col gap-6 mb-6">
        {/* left: big card spanning 2 columns */}
        <div className="col-span-2 bg-white border border-gray-100 rounded-md shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">Plan name</div>
              <div className="text-lg font-semibold">Pro Tier</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Billing cycle</div>
              <div className="text-lg font-semibold">Monthly</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Plan cost</div>
              <div className="text-lg font-semibold">₦ 4,999</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-blue-600 mb-2">{daysLeft} days until renewal</div>
            <ProgressBar percent={percentLeft} />
          </div>

        </div>

        {/* right: payment method card */}
        <div className="bg-white border border-gray-100 rounded-md shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <img src="/card-image.png" alt="card" className="w-12 h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-medium">Master Card</span>
              <span className="text-sm text-gray-500">**** **** **** 4002</span>
              <span className="text-xs text-gray-400">Expiry on 30/2028</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">billing@acme.corp</span>
            <button className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-bold">Update</button>
          </div>
        </div>
      </div>

      {/* big gauge card */}
      <div className="bg-white border border-gray-100 rounded-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-gray-500">Next Billing Date</div>
            <div className="text-lg font-medium">12 Jun, 2024</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Amount</div>
            <div className="text-lg font-medium">₦ 4,999.00</div>
          </div>
        </div>

        <div className="flex items-center justify-center py-6">
          <div className="w-full max-w-md">
            <Gauge percent={percentLeft} size={320} />
            <div className="text-center -mt-6">
              <div className="text-4xl font-bold text-blue-600">{daysLeft}</div>
              <div className="text-sm text-gray-500">days until renewal</div>
            </div>
          </div>
        </div>
      </div>

      {/* bottom summary with full width progress */}
      <div className="bg-white border border-gray-100 rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Pro Tier</h3>
            <Badge variant="green">Active</Badge>
          </div>
        </div>

        <div className="bg-blue-50 rounded-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Next Billing Date</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-600">12 Jun, 2024</div>
              <div className="text-sm font-medium text-blue-600">₦ 4,999.00</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-blue-700 font-semibold mb-2">{daysLeft} days until next renewal</div>
        <ProgressBar percent={percentLeft} />
      </div>

    </div>
  );
}
