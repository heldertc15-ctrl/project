export function Dashboard() {

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="container mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">Dashboard</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Your central hub for match insights and predictions
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Featured Match Section */}
          <div className="md:col-span-2 lg:col-span-2 bg-[var(--color-surface)] rounded-xl shadow-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">Featured Match</h2>
            </div>
            <div className="bg-[var(--color-surface-secondary)] rounded-lg p-6 text-center">
              <div className="text-[var(--color-text-muted)] mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">No Featured Match</h3>
              <p className="text-[var(--color-text-secondary)]">
                Featured matches will appear here when available
              </p>
            </div>
          </div>

          {/* My Predictions Section */}
          <div className="bg-[var(--color-surface)] rounded-xl shadow-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">My Predictions</h2>
            </div>
            <div className="bg-[var(--color-surface-secondary)] rounded-lg p-6 text-center">
              <div className="text-[var(--color-text-muted)] mb-4">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No Predictions Yet</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Your prediction history will appear here
              </p>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="bg-[var(--color-surface)] rounded-xl shadow-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--color-info)] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">Quick Stats</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-[var(--color-surface-secondary)] rounded-lg p-4">
                <div className="text-2xl font-bold text-[var(--color-text)]">0</div>
                <div className="text-[var(--color-text-secondary)] text-sm">Total Predictions</div>
              </div>
              <div className="bg-[var(--color-surface-secondary)] rounded-lg p-4">
                <div className="text-2xl font-bold text-[var(--color-success)]">0%</div>
                <div className="text-[var(--color-text-secondary)] text-sm">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-[var(--color-surface)] rounded-xl shadow-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--color-warning)] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">Recent Activity</h2>
            </div>
            <div className="bg-[var(--color-surface-secondary)] rounded-lg p-6 text-center">
              <div className="text-[var(--color-text-muted)] mb-4">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No Recent Activity</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Your recent activity will appear here
              </p>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="bg-[var(--color-surface)] rounded-xl shadow-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--color-success)] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-3 px-4 rounded-lg font-medium transition-colors text-sm">
                Make Prediction
              </button>
              <button className="w-full bg-[var(--color-surface-secondary)] hover:bg-[var(--color-border)] text-[var(--color-text)] py-3 px-4 rounded-lg font-medium transition-colors border border-[var(--color-border)] text-sm">
                View All Matches
              </button>
              <button className="w-full bg-[var(--color-surface-secondary)] hover:bg-[var(--color-border)] text-[var(--color-text)] py-3 px-4 rounded-lg font-medium transition-colors border border-[var(--color-border)] text-sm">
                Prediction History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}