import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="content-container">
        {children}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .app-container {
          display: flex;
          min-height: 100vh;
          position: relative;
        }
        
        .content-container {
          flex: 1;
          min-height: 100vh;
          overflow-y: auto;
          background-color: #f8fafc;
        }
      `}} />
    </div>
  )
}
