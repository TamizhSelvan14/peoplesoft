import React, { useEffect, useState } from 'react'
import client from '../api/client'

const LEAVE_TYPES = [
  { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
  { value: 'vacation', label: 'Vacation Leave' },
]

// Count working days (Mon–Fri) between two dates (inclusive)
const workingDaysBetween = (startStr, endStr) => {
  if (!startStr || !endStr) return 0
  const start = new Date(startStr)
  const end = new Date(endStr)
  if (end < start) return 0

  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const day = cur.getDay() // 0 = Sun, 6 = Sat
    if (day !== 0 && day !== 6) {
      count++
    }
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export default function Leaves() {
  const [rows, setRows] = useState([])
  const [balances, setBalances] = useState([])
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    type: 'sick',
    reason: '',
  })
  const [view, setView] = useState('my') // 'my' | 'team'
  const [error, setError] = useState('')

  const role = localStorage.getItem('role') || ''
  const canApprove = role === 'manager'

  const today = new Date().toISOString().slice(0, 10)

  const loadMy = async () => {
    setError('')
    const [leavesRes, balRes] = await Promise.all([
      client.get('/api/leaves/my'),
      client.get('/api/leaves/balance'),
    ])
    setRows(leavesRes.data.data || [])
    setBalances(balRes.data.data || [])
    setView('my')
  }

  const loadTeam = async () => {
    setError('')
    const { data } = await client.get('/api/leaves/team')
    setRows(data.data || [])
    setView('team')
  }

  useEffect(() => {
    loadMy()
  }, [])

  const getRemainingForType = (type) => {
    const rec = balances.find((b) => b.type === type)
    return rec ? rec.remaining : null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    const days = workingDaysBetween(form.start_date, form.end_date)
    if (days <= 0) {
      setError('Please select at least one working day (weekends are ignored).')
      return
    }

    const remaining = getRemainingForType(form.type)
    if (remaining != null && days > remaining) {
      setError(
        `You only have ${remaining} ${form.type} day(s) remaining, but selected ${days}.`
      )
      return
    }

    await client.post('/api/leaves', form)

    setForm({
      start_date: '',
      end_date: '',
      type: form.type, // keep last selected type
      reason: '',
    })

    if (view === 'team') {
      loadTeam()
    } else {
      loadMy()
    }
  }

  const approve = async (id) => {
    await client.put(`/api/leaves/${id}/approve`)
    view === 'team' ? loadTeam() : loadMy()
  }

  const reject = async (id) => {
    await client.put(`/api/leaves/${id}/reject`)
    view === 'team' ? loadTeam() : loadMy()
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '30px',
      background: 'transparent'
    }}>
      {/* Header Card + view buttons */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Leave Management</h3>
        <div style={{display: 'flex', gap: '10px'}}>
          <button
            type="button"
            style={{
              background: view === 'my' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: view === 'my' ? 'white' : '#667eea',
              border: view === 'my' ? 'none' : '2px solid #667eea',
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: view === 'my' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
            }}
            onClick={loadMy}
            onMouseEnter={(e) => {
              if (view !== 'my') {
                e.target.style.background = 'rgba(102, 126, 234, 0.1)'
                e.target.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (view !== 'my') {
                e.target.style.background = 'transparent'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            My Leaves
          </button>
          <button
            type="button"
            style={{
              background: view === 'team' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: view === 'team' ? 'white' : '#667eea',
              border: view === 'team' ? 'none' : '2px solid #667eea',
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: view === 'team' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
            }}
            onClick={loadTeam}
            onMouseEnter={(e) => {
              if (view !== 'team') {
                e.target.style.background = 'rgba(102, 126, 234, 0.1)'
                e.target.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (view !== 'team') {
                e.target.style.background = 'transparent'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            My Team
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: '500'
        }}>{error}</div>
      )}

      {/* Main Layout with Sidebar */}
      <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
        {/* Sidebar - Leave Balance */}
        {view === 'my' && balances.length > 0 && (
          <div style={{
            width: '280px',
            flexShrink: 0
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'sticky',
              top: '20px'
            }}>
              <h6 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b'
              }}>Annual Leave Balance</h6>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {balances.map((b) => (
                  <div
                    key={b.type}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '4px'}}>
                      {b.type.toUpperCase()}
                    </div>
                    <div style={{fontSize: '20px', fontWeight: '700'}}>
                      {b.remaining} / {b.total}
                    </div>
                    <div style={{fontSize: '11px', opacity: 0.8, marginTop: '2px'}}>
                      day(s) remaining
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div style={{flex: 1}}>
          {/* Request form */}
          <form onSubmit={submit} style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'end'}}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569'
                }}>Start Date</label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(203, 213, 224, 0.6)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  min={today}
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(203, 213, 224, 0.6)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569'
                }}>End Date</label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(203, 213, 224, 0.6)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  min={form.start_date || today}
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(203, 213, 224, 0.6)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569'
                }}>Type</label>
                <select
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(203, 213, 224, 0.6)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(203, 213, 224, 0.6)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569'
                }}>Reason</label>
                <input
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(203, 213, 224, 0.6)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="Reason"
                  value={form.reason}
                  onChange={(e) =>
                    setForm({ ...form, reason: e.target.value })
                  }
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(203, 213, 224, 0.6)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>
            </div>

            {/* Request button below the form fields */}
            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end'}}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 40px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >Request</button>
            </div>
          </form>

          {/* Leaves table */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <th style={{padding: '16px', fontWeight: '600', fontSize: '14px', textAlign: 'left'}}>ID</th>
                  <th style={{padding: '16px', fontWeight: '600', fontSize: '14px', textAlign: 'left'}}>Employee</th>
                  <th style={{padding: '16px', fontWeight: '600', fontSize: '14px', textAlign: 'left'}}>Start</th>
                  <th style={{padding: '16px', fontWeight: '600', fontSize: '14px', textAlign: 'left'}}>End</th>
                  <th style={{padding: '16px', fontWeight: '600', fontSize: '14px', textAlign: 'left'}}>Type</th>
                  <th style={{padding: '16px', fontWeight: '600', fontSize: '14px', textAlign: 'left'}}>Reason</th>
                  <th style={{padding: '16px', fontWeight: '600', fontSize: '14px', textAlign: 'left'}}>Status</th>
                  <th style={{padding: '16px', fontWeight: '600', fontSize: '14px', textAlign: 'left'}}>Approved By</th>
                  <th style={{padding: '16px', fontWeight: '600', fontSize: '14px', textAlign: 'left'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const id = r.id || r.ID
                  const status = (r.status || r.Status || '').toLowerCase()
                  const canAct = canApprove && status === 'pending'

                  const userName =
                    r.user_name || r.UserName || r.user_id || r.UserID
                  const approvedByName =
                    r.approved_by_name || r.ApprovedByName || '-'

                  return (
                    <tr key={id} style={{
                      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}>
                      <td style={{padding: '14px', color: '#475569', fontSize: '14px'}}>
                        <span style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          color: '#667eea',
                          fontWeight: '600'
                        }}>{id}</span>
                      </td>
                      <td style={{padding: '14px', color: '#1e293b', fontSize: '14px', fontWeight: '500'}}>{userName}</td>
                      <td style={{padding: '14px', color: '#475569', fontSize: '14px'}}>
                        {(r.start_date || r.StartDate || '').slice(0, 10)}
                      </td>
                      <td style={{padding: '14px', color: '#475569', fontSize: '14px'}}>
                        {(r.end_date || r.EndDate || '').slice(0, 10)}
                      </td>
                      <td style={{padding: '14px', color: '#475569', fontSize: '14px', fontWeight: '600'}}>{(r.type || r.Type || '').toUpperCase()}</td>
                      <td style={{padding: '14px', color: '#475569', fontSize: '14px'}}>{r.reason || r.Reason}</td>
                      <td style={{padding: '14px', fontSize: '14px'}}>
                        <span style={{
                          background: status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: status === 'approved' ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#ca8a04',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>{status}</span>
                      </td>
                      <td style={{padding: '14px', color: '#475569', fontSize: '14px'}}>{approvedByName}</td>
                      <td style={{padding: '14px'}}>
                        <div style={{display: 'flex', gap: '8px'}}>
                          {canAct && (
                            <>
                              <button
                                style={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 16px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                }}
                                onClick={() => approve(id)}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'translateY(-2px)'
                                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'translateY(0)'
                                  e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
                                }}
                              >
                                Approve
                              </button>
                              <button
                                style={{
                                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 16px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                                }}
                                onClick={() => reject(id)}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'translateY(-2px)'
                                  e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)'
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'translateY(0)'
                                  e.target.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)'
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#94a3b8',
                      fontSize: '14px'
                    }}>
                      No leaves found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
