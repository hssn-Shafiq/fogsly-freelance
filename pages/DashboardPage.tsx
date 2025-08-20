import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { 
  Settings, Star, Briefcase, 
  DollarSign, PieChart as PieChartIcon, MessageSquare, ArrowRight,
  Plus, Download, Upload, 
  Activity, BarChart2, Users as UsersIcon
} from "lucide-react";

const COLORS = ['var(--color-primary)', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('year');
  const [activeProject, setActiveProject] = useState(0);

  // Mock data
  const profile = {
    stats: {
      earnings: 328500,
      clients: 42,
      satisfaction: 99,
    }
  };

  const projects = [
    { id: 1, title: "Fintech Dashboard", client: "Stripe", status: "completed", budget: 12800, duration: "3 months", progress: 100, technologies: ["Figma", "React", "TypeScript"] },
    { id: 2, title: "Healthcare App", client: "Teladoc", status: "active", budget: 24000, duration: "6 months", progress: 65, technologies: ["Sketch", "Swift", "Firebase"] },
    { id: 3, title: "E-commerce Platform", client: "Nordstrom", status: "planning", budget: 18500, duration: "4 months", progress: 15, technologies: ["Figma", "Next.js", "Node.js"] }
  ];
  
  const earningsData = {
    week: [{ name: 'Mon', earnings: 1200 }, { name: 'Tue', earnings: 1800 }, { name: 'Wed', earnings: 900 }, { name: 'Thu', earnings: 2100 }, { name: 'Fri', earnings: 3200 }, { name: 'Sat', earnings: 800 }, { name: 'Sun', earnings: 400 }],
    month: [{ name: 'Week 1', earnings: 10200 }, { name: 'Week 2', earnings: 14500 }, { name: 'Week 3', earnings: 9800 }, { name: 'Week 4', earnings: 16000 }],
    quarter: [{ name: 'Month 1', earnings: 40500 }, { name: 'Month 2', earnings: 35200 }, { name: 'Month 3', earnings: 51000 }],
    year: [{ name: 'Jan', earnings: 40000 }, { name: 'Feb', earnings: 30000 }, { name: 'Mar', earnings: 60000 }, { name: 'Apr', earnings: 48000 }, { name: 'May', earnings: 52000 }, { name: 'Jun', earnings: 75000 }, { name: 'Jul', earnings: 68000 }, { name: 'Aug', earnings: 71000 }, { name: 'Sep', earnings: 58000 }, { name: 'Oct', earnings: 62000 }, { name: 'Nov', earnings: 81000 }, { name: 'Dec', earnings: 95000 }],
  };

  const trafficData = [{ name: 'Desktop', value: 400 }, { name: 'Mobile', value: 300 }, { name: 'Tablet', value: 200 }, { name: 'Other', value: 100 }];
  const activityData = [{ time: '9:00 AM', action: 'Logged in', project: 'Fintech Dashboard' }, { time: '10:30 AM', action: 'Updated project', project: 'Healthcare App' }, { time: '12:15 PM', action: 'Meeting', project: 'E-commerce Platform' }, { time: '2:00 PM', action: 'Submitted work', project: 'Healthcare App' }, { time: '4:45 PM', action: 'Received payment', project: 'Fintech Dashboard' }];

  const tabs = [
    { id: 'dashboard', icon: <PieChartIcon size={18} />, label: 'Dashboard' },
    { id: 'projects', icon: <Briefcase size={18} />, label: 'Projects' },
    { id: 'analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
    { id: 'clients', icon: <UsersIcon size={18} />, label: 'Clients' },
    { id: 'earnings', icon: <DollarSign size={18} />, label: 'Earnings' },
    { id: 'settings', icon: <Settings size={18} />, label: 'Settings' }
  ];

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const renderContent = () => {
    switch (activeTab) {
        case 'dashboard': return <DashboardContent />;
        case 'projects': return <ProjectsContent />;
        default: return <PlaceholderContent title={activeTab} />;
    }
  };

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Briefcase size={20} className="text-blue-600" />} title="Active Projects" value={projects.filter(p => p.status === 'active').length} change="+2 from last month" trend="up" />
        <StatCard icon={<DollarSign size={20} className="text-green-600" />} title="Total Earnings" value={formatCurrency(profile.stats.earnings)} change="+12% from last year" trend="up" />
        <StatCard icon={<UsersIcon size={20} className="text-purple-600" />} title="Active Clients" value={profile.stats.clients} change="+3 from last quarter" trend="up" />
        <StatCard icon={<Star size={20} className="text-amber-500" />} title="Satisfaction Rate" value={`${profile.stats.satisfaction}%`} change="+2% from last month" trend="up" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Earnings Overview</CardTitle>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earningsData[timeRange as keyof typeof earningsData]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                <Legend />
                <Line type="monotone" dataKey="earnings" stroke="var(--color-primary)" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Traffic Sources</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trafficData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="var(--color-primary)" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {trafficData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Your current projects and their status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-[--color-text-primary]">{project.title}</h3>
                  <p className="text-sm text-[--color-text-secondary]">{project.client} • {project.duration}</p>
                </div>
                <div className="w-full sm:w-48">
                  <div className="flex justify-between text-sm mb-1"><span className="text-[--color-text-secondary]">Progress</span><span className="font-medium">{project.progress}%</span></div>
                  <div className="h-2 bg-[--color-bg-tertiary] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${project.status === 'completed' ? 'bg-green-500' : 'bg-[--color-primary]'}`} style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t border-[--color-border]"><Button variant="link" className="text-[--color-primary] px-0">View all projects <ArrowRight size={16} className="ml-1" /></Button></CardFooter>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {activityData.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="p-2 bg-[--color-primary]/10 rounded-full mr-3 mt-1"><Activity size={16} className="text-[--color-primary]" /></div>
                <div>
                  <p className="font-medium text-[--color-text-primary] text-sm">{activity.action}</p>
                  <p className="text-sm text-[--color-text-secondary]">{activity.project}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
  
  const ProjectsContent = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[--color-text-primary]">Projects</h2>
            <Button><Plus size={16} className="mr-2" /> New Project</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
            <motion.div key={project.id} {...{ whileHover: { y: -5 }, transition: { type: 'spring', stiffness: 400, damping: 10 } }}>
                <Card className={`cursor-pointer transition-all h-full flex flex-col ${activeProject === index ? 'ring-2 ring-[--color-primary]' : 'hover:shadow-lg'}`} onClick={() => setActiveProject(index)}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <CardDescription>{project.client}</CardDescription>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{project.status}</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="flex justify-between text-sm"><span className="text-[--color-text-secondary]">Budget</span><span className="font-medium">{formatCurrency(project.budget)}</span></div>
                    <div className="flex justify-between text-sm mt-2"><span className="text-[--color-text-secondary]">Duration</span><span className="font-medium">{project.duration}</span></div>
                </CardContent>
                <CardFooter className="border-t border-[--color-border] pt-4">
                    <Button variant="outline" size="sm" className="w-full"><MessageSquare size={16} className="mr-2" /> Chat with Client</Button>
                </CardFooter>
                </Card>
            </motion.div>
            ))}
        </div>
    </div>
  );
  
  const PlaceholderContent = ({ title }: { title: string }) => (
    <div>
        <h2 className="text-2xl font-bold text-[--color-text-primary] capitalize">{title}</h2>
        <p className="text-[--color-text-secondary] mt-2">This section is under construction.</p>
    </div>
  );

  return (
    <div className="flex bg-[--color-bg-secondary]">
      <aside className="hidden md:block w-64 bg-[--color-card] border-r border-[--color-border] h-screen sticky top-[60px]">
        <div className="p-4 h-full overflow-y-auto">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[--color-primary]/10 text-[--color-primary]' : 'text-[--color-text-secondary] hover:bg-[--color-bg-secondary]'}`}>
                <span className="mr-3">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wider mb-3 px-4">Quick Actions</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-[--color-text-secondary]"><Plus size={16} className="mr-2" /> New Project</Button>
              <Button variant="ghost" className="w-full justify-start text-[--color-text-secondary]"><Upload size={16} className="mr-2" /> Upload Files</Button>
              <Button variant="ghost" className="w-full justify-start text-[--color-text-secondary]"><Download size={16} className="mr-2" /> Download Report</Button>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-6 pt-24 min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
};

// Reusable Stat Card Component
function StatCard({ icon, title, value, change, trend }: { icon: React.ReactNode; title: string; value: string | number; change: string; trend: 'up' | 'down'; }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="rounded-lg bg-[--color-bg-secondary] p-2">{icon}</div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>{change}</span>
        </div>
        <h3 className="text-lg font-medium text-[--color-text-secondary] mt-4">{title}</h3>
        <p className="text-2xl font-bold text-[--color-text-primary] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

export default DashboardPage;