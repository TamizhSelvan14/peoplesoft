import React, { useEffect, useMemo, useState } from 'react'
import client from '../api/client'

export default function Employees(){
  const role = localStorage.getItem('role') || 'employee'

  // table data
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  // filters
  const [q, setQ] = useState('')
  const [designation, setDesignation] = useState('')
  const [departmentId, setDepartmentId] = useState('')

  // modal state
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    user_role: 'employee',
    user_id: '',
    designation: '',
    department_id: '',
    manager_id: '',
    phone: '',
    location: ''
  })
  const [err, setErr] = useState('')

  // No longer needed - backend now returns manager_name directly
  // const managerNameById = useMemo(() => {
  //   const m = new Map()
  //   rows.forEach(r => m.set(r.id, r.name))
  //   return m
  // }, [rows])

  const [myTeamMode, setMyTeamMode] = useState(false)

  const queryString = useMemo(() => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (designation) p.set('designation', designation)
    if (departmentId) p.set('department_id', departmentId)
    p.set('page', page)
    p.set('page_size', size)
    return p.toString()
  }, [q, designation, departmentId, page, size])

  const load = async () => {
    const url = myTeamMode ? '/api/my-team' : `/api/employees?${queryString}`
    const { data } = await client.get(url)
    
    let filteredRows = data.data || []
    
    if (myTeamMode) {
      if (q) {
        const lowerQ = q.toLowerCase()
        filteredRows = filteredRows.filter(r => 
          r.name?.toLowerCase().includes(lowerQ) || 
          r.email?.toLowerCase().includes(lowerQ)
        )
      }
      if (designation) {
        const lowerDesig = designation.toLowerCase()
        filteredRows = filteredRows.filter(r => 
          r.designation?.toLowerCase().includes(lowerDesig)
        )
      }
      if (departmentId) {
        filteredRows = filteredRows.filter(r => 
          String(r.department_id) === departmentId
        )
      }
    }
    
    setRows(filteredRows)
    setTotal(
      typeof data.total === 'number'
        ? data.total
        : filteredRows.length
    )
  }

  useEffect(()=>{ load() /* eslint-disable-next-line */ }, [queryString, myTeamMode])

  // ----- actions -----
  const openAdd = () => {
    setIsEdit(false)
    setCurrentId(null)
    setCurrentUserId(null)
    setForm({ 
      name: '',
      email: '',
      password: '',
      user_role: 'employee',
      user_id:'', 
      designation:'', 
      department_id:'', 
      manager_id:'', 
      phone:'', 
      location:'' 
    })
    setErr('')
    setShowModal(true)
  }

  const openEdit = (row) => {
    setIsEdit(true)
    setCurrentId(row.id)
    setCurrentUserId(row.user_id)
    setForm({
      name: row.name || '',
      email: row.email || '',
      password: '',
      user_role: 'employee',
      user_id: row.user_id ?? '',
      designation: row.designation || '',
      department_id: row.department_id || '',
      manager_id: (row.manager_id ?? '') || '',
      phone: row.phone || '',
      location: row.location || ''
    })
    setErr('')
    setShowModal(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      if (isEdit) {
        const payload = {
          ...(form.designation ? { designation: form.designation } : {}),
          ...(form.department_id ? { department_id: Number(form.department_id) } : {}),
          ...(form.manager_id !== '' ? { manager_id: form.manager_id === null ? null : Number(form.manager_id) } : { manager_id: null }),
          ...(form.phone ? { phone: form.phone } : {}),
          ...(form.location ? { location: form.location } : {})
        }
        await client.put(`/api/employees/${currentId}`, payload)
      } else {
        // Onboarding: Create user first, then employee
        const userPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.user_role,
          department_id: form.department_id ? Number(form.department_id) : null
        }
        
        await client.post('/api/auth/register', userPayload)
        
        const { data: userData } = await client.get(`/api/users/by-email/${form.email}`)
        console.log('User data received:', userData)
        const employeePayload = {
          user_id: userData.id,
          designation: form.designation,
          department_id: form.department_id ? Number(form.department_id) : 0,
          manager_id: form.manager_id ? Number(form.manager_id) : null,
          phone: form.phone,
          location: form.location
        }
        console.log('Employee payload:', employeePayload)  
        await client.post('/api/employees', employeePayload)
      }
      setShowModal(false)
      await load()
    } catch (e) {
      setErr(e?.response?.data?.error || 'Operation failed')
    }
  }

  const offboard = async (employeeId, userId, employeeName) => {
    if (!window.confirm(`Are you sure you want to offboard ${employeeName}?`)) return
    
    try {
      await client.delete(`/api/employees/${employeeId}`)
      await client.delete(`/api/users/${userId}`)
      await load()
    } catch (e) {
      alert('Offboarding failed: ' + (e?.response?.data?.error || 'Unknown error'))
    }
  }

  return (
    <div style={{minHeight: '100vh', padding: '20px'}}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '600'}}>
          Employee Directory
        </h3>

        <div style={{display: 'flex', gap: '12px'}}>
          {(role === 'manager' || role === 'hr') && (
            <button
              style={{
                background: myTeamMode ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.5)',
                border: myTeamMode ? '2px solid rgba(99, 102, 241, 0.8)' : '2px solid rgba(99, 102, 241, 0.3)',
                color: myTeamMode ? 'white' : '#4a5568',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onClick={() => { setMyTeamMode(m => !m); setPage(1) }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              {myTeamMode ? 'All Employees' : 'My Team'}
            </button>
          )}

          {role === 'hr' && (
            <button
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onClick={openAdd}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)'
              }}
            >
              Onboard
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '22px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div className="row g-2">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Search name or email"
              style={{
                borderRadius: '10px',
                border: '2px solid rgba(99, 102, 241, 0.2)',
                padding: '10px 14px',
                fontSize: '14px'
              }}
              value={q}
              onChange={e=>{setPage(1); setQ(e.target.value)}}
            />
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Designation"
              style={{
                borderRadius: '10px',
                border: '2px solid rgba(99, 102, 241, 0.2)',
                padding: '10px 14px',
                fontSize: '14px'
              }}
              value={designation}
              onChange={e=>{setPage(1); setDesignation(e.target.value)}}
            />
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Department ID"
              style={{
                borderRadius: '10px',
                border: '2px solid rgba(99, 102, 241, 0.2)',
                padding: '10px 14px',
                fontSize: '14px'
              }}
              value={departmentId}
              onChange={e=>{setPage(1); setDepartmentId(e.target.value)}}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              style={{
                borderRadius: '10px',
                border: '2px solid rgba(99, 102, 241, 0.2)',
                padding: '10px 14px',
                fontSize: '14px'
              }}
              value={size}
              onChange={e=>{setPage(1); setSize(Number(e.target.value))}}>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
        {myTeamMode && (
          <small style={{color: '#667eea', marginTop: '12px', display: 'block', fontWeight: '500'}}>
            Showing only your direct reports
          </small>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <table className="table table-hover" style={{marginBottom: 0}}>
          <thead>
            <tr style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
              borderBottom: '2px solid rgba(99, 102, 241, 0.3)'
            }}>
              <th style={{padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px'}}>EmpID</th>
              <th style={{padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px'}}>Name</th>
              <th style={{padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px'}}>Email</th>
              <th style={{padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px'}}>Designation</th>
              {!myTeamMode && <th style={{padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px'}}>Manager</th>}
              <th style={{padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px'}}>Phone</th>
              <th style={{padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px'}}>Location</th>
              {(role === 'hr' || role === 'manager') && <th style={{padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px', width: '200px'}}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{borderBottom: '1px solid rgba(0, 0, 0, 0.05)'}}>
                <td style={{padding: '14px', color: '#4a5568', fontSize: '14px', fontWeight: '600'}}>
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    color: '#667eea'
                  }}>
                    {r.id}
                  </span>
                </td>
                <td style={{padding: '14px', color: '#2d3748', fontSize: '14px', fontWeight: '500'}}>{r.name}</td>
                <td style={{padding: '14px', color: '#4a5568', fontSize: '13px'}}>{r.email}</td>
                <td style={{padding: '14px', color: '#4a5568', fontSize: '14px'}}>{r.designation}</td>
                {!myTeamMode && <td style={{padding: '14px', color: '#4a5568', fontSize: '14px'}}>{r.manager_name || '-'}</td>}
                <td style={{padding: '14px', color: '#4a5568', fontSize: '14px'}}>{r.phone}</td>
                <td style={{padding: '14px', color: '#4a5568', fontSize: '14px'}}>{r.location}</td>
                {(role === 'hr' || role === 'manager') && (
                  <td style={{padding: '14px'}}>
                    <div className="d-flex gap-2">
                      <button
                        style={{
                          background: 'rgba(99, 102, 241, 0.6)',
                          border: 'none',
                          color: 'white',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={()=>openEdit(r)}
                        onMouseEnter={e => e.target.style.background = 'rgba(99, 102, 241, 0.8)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(99, 102, 241, 0.6)'}
                      >
                        Edit
                      </button>
                      {role === 'hr' && (
                        <button
                          style={{
                            background: 'rgba(239, 68, 68, 0.6)',
                            border: 'none',
                            color: 'white',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={()=>offboard(r.id, r.user_id, r.name)}
                          onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.8)'}
                          onMouseLeave={e => e.target.style.background = 'rgba(239, 68, 68, 0.6)'}
                        >
                          Offboard
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        padding: '0 10px'
      }}>
        <small style={{color: 'white', fontSize: '14px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
          Total: {total}
        </small>
        <div style={{display: 'flex', gap: '10px'}}>
          <button
            style={{
              background: page <= 1 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.95)',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              color: page <= 1 ? '#a0aec0' : '#667eea',
              padding: '8px 20px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            disabled={page<=1}
            onClick={()=>setPage(p=>p-1)}
            onMouseEnter={e => {
              if (page > 1) e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              if (page > 1) e.target.style.transform = 'translateY(0)'
            }}
          >
            Prev
          </button>
          <button
            style={{
              background: (page*size)>=total ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.95)',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              color: (page*size)>=total ? '#a0aec0' : '#667eea',
              padding: '8px 20px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: (page*size)>=total ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            disabled={(page*size)>=total}
            onClick={()=>setPage(p=>p+1)}
            onMouseEnter={e => {
              if ((page*size) < total) e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              if ((page*size) < total) e.target.style.transform = 'translateY(0)'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={save}>
                <div className="modal-header">
                  <h5 className="modal-title">{isEdit ? 'Edit Employee' : 'Onboard Employee'}</h5>
                  <button type="button" className="btn-close" onClick={()=>setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {err && <div className="alert alert-danger">{err}</div>}

                  {!isEdit && (
                    <>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Full Name *</label>
                          <input className="form-control" value={form.name}
                            onChange={e=>setForm({...form, name:e.target.value})} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Email *</label>
                          <input type="email" className="form-control" value={form.email}
                            onChange={e=>setForm({...form, email:e.target.value})} autoComplete="new-email" required />
                            
                        </div>
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Password *</label>
                          <input type="password" className="form-control" value={form.password}
                            onChange={e=>setForm({...form, password:e.target.value})} autoComplete="new-password" required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Role *</label>
                          <select className="form-select" value={form.user_role}
                            onChange={e=>setForm({...form, user_role:e.target.value})} required>
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="hr">HR/Admin</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Designation *</label>
                      <input className="form-control" value={form.designation}
                        onChange={e=>setForm({...form, designation:e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department ID *</label>
                      <input type="number" className="form-control" value={form.department_id}
                        onChange={e=>setForm({...form, department_id:e.target.value})} required />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Manager ID</label>
                      <input type="number" className="form-control" value={form.manager_id}
                        onChange={e=>setForm({...form, manager_id:e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={form.phone}
                        onChange={e=>setForm({...form, phone:e.target.value})} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input className="form-control" value={form.location}
                      onChange={e=>setForm({...form, location:e.target.value})} />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    {isEdit ? 'Save Changes' : 'Onboard Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}