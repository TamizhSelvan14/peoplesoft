import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Leaves from './pages/Leaves'
import Performance from './pages/Performance'
import Goals from './pages/Goals'
import SelfAssessment from './pages/SelfAssessment'
import ManagerReview from './pages/ManagerReview'
import PerfReports from './pages/PerfReports'
import Onboarding from './pages/Onboarding'
import AuthCallback from './pages/AuthCallback'
import Unauthorized from './pages/Unauthorized'
import PerformanceDashboard from './pages/Performance/PerformanceDashboard'
import PerformanceGoals from './pages/Performance/Goals'
import PerformanceReviews from './pages/Performance/Reviews'
import PerformanceAnalytics from './pages/Performance/Analytics'
import { PrivateRoute, RoleBasedRoute } from './components/RoleBasedRoute'

export default function App() {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout: auth0Logout } = useAuth0()

    const userRole = localStorage.getItem('role')

    const logout = () => {
        localStorage.clear()
        auth0Logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        })
    }

    // Hide navigation on login, callback, and unauthorized pages
    const hideNavRoutes = ['/login', '/callback', '/unauthorized']
    const showNav = !hideNavRoutes.includes(location.pathname) && !!localStorage.getItem('token')

    return (
        <div className="container py-4">
            {showNav && (
                <nav className="d-flex gap-3 mb-4 flex-wrap align-items-center">
                    <Link to="/">Dashboard</Link>

                    {/* HR and Manager can see Employees */}
                    {(['hr', 'manager'].includes(userRole)) && (
                        <Link to="/employees">Employees</Link>
                    )}

                    {/* Everyone can see Leaves */}
                    <Link to="/leaves">Leaves</Link>

                    {/* Everyone can see Performance (with different access levels) */}
                    <Link to="/performance">Performance</Link>

                    {/* New Performance Management Routes */}
                    {(['hr', 'manager'].includes(userRole)) && (
                        <>
                            <Link to="/performance/dashboard">Performance Dashboard</Link>
                            <Link to="/performance/analytics">Analytics</Link>
                        </>
                    )}
                    <Link to="/performance/goals">My Goals</Link>
                    <Link to="/performance/reviews">Reviews</Link>

                    {/* Everyone can see Reports (with different access levels) */}
                    <Link to="/reports/performance">Reports</Link>

                    {/* Everyone */}
                    <Link to="/goals">Goals</Link>
                    <Link to="/self-assessment">Self Assessment</Link>

                    {/* Manager and HR */}
                    {(['hr', 'manager'].includes(userRole)) && (
                        <Link to="/manager/review">Manager Review</Link>
                    )}

                    <button className="btn btn-link ms-auto" onClick={logout}>Logout</button>
                </nav>
            )}

            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/callback" element={<AuthCallback />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* All authenticated users */}
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/leaves" element={<PrivateRoute><Leaves /></PrivateRoute>} />
                <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
                <Route path="/self-assessment" element={<PrivateRoute><SelfAssessment /></PrivateRoute>} />
                <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

                {/* Performance - All can access but with different views */}
                <Route path="/performance" element={<PrivateRoute><Performance /></PrivateRoute>} />

                {/* New Performance Management Routes */}
                <Route path="/performance/dashboard" element={<PrivateRoute><PerformanceDashboard /></PrivateRoute>} />
                <Route path="/performance/goals" element={<PrivateRoute><PerformanceGoals /></PrivateRoute>} />
                <Route path="/performance/reviews" element={<PrivateRoute><PerformanceReviews /></PrivateRoute>} />
                <Route path="/performance/analytics" element={
                    <RoleBasedRoute allowedRoles={['manager', 'hr']}>
                        <PerformanceAnalytics />
                    </RoleBasedRoute>
                } />

                {/* Reports - All can access but with different views */}
                <Route path="/reports/performance" element={<PrivateRoute><PerfReports /></PrivateRoute>} />

                {/* Manager and HR only */}
                <Route path="/employees" element={
                    <RoleBasedRoute allowedRoles={['manager', 'hr']}>
                        <Employees />
                    </RoleBasedRoute>
                } />

                <Route path="/manager/review" element={<PrivateRoute><ManagerReview /></PrivateRoute>} />
            </Routes>
        </div>
    )
}