
import axios from "axios"
import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router"

import {ChartIcon,CheckIcon,ClockIcon,ExclamationIcon,FilterIcon,IssueIcon,SettingsIcon,WhatsAppIcon} from "../constants/icons.jsx"
import { getAvgResolution, getPriorityColor,getStatusColor } from "../constants/helpers.jsx"
import { IssueDetails } from "../components/IssueDetails.jsx"

function Dashboard() {

  const [connected,setConnected]=useState(false)
  const [filters, setFilters] = useState({
    group: "all",
    priority: "all",
    status: "all",
  })
  const [issues,setIssues] = useState([])
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [analytics,setAnalytics]=useState({totalIssues:0,criticalIssues:0,openIssues:0,resolvedIssues:0,avgResolution:0 })
  const page_size=10

  // Get unique values for filters
  const [groups,setGroups]=useState([])
  let [currentPage,setCurrentPage]=useState(1)
  const priorities = [...new Set(issues.map((issue) => issue.priority))]
  const statuses = ['open','closed']

  const fetchData=()=>{
    const params=new URLSearchParams()
    Object.keys(filters).map(filter=>{
      if(filters[filter]!='all'){
        params.set(filter,filters[filter])
      }
    })
    params.set('page',currentPage)
    
    axios.get(`/api/a/issues?${params?.toString()}`)
    .then(res=>{
        setIssues(res.data?.data)
    })
    .catch(err=>{
        console.log(err?.message)
    })

    axios.get(`/api/a/issues/analytics${filters?.group!='all'?`?group=${filters.group}`:''}`)
    .then(res=>{
        setAnalytics(res.data?.data)
    })
    .catch(err=>{
        console.log(err?.message)
    })

    axios.get(`/api/a/groups`)
    .then(res=>{
      setGroups(res.data?.data?.map(group=>{
        return {
          id: group?.id,
          name: group?.name
        }
      }))
    })
    .catch(err=>{
        console.log(err?.message)
    })
  }

  useEffect(()=>{

    fetchData()

  },[filters,currentPage])

  useEffect(()=>{
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const {type,payload} = JSON.parse(event.data);
      if(type && type=='issue'){
        fetchData()
      }
      if(type && type=='client' && payload){
        if(payload=='online') setConnected(true);
        if(payload=='offline') setConnected(false)
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    axios.get(`/api/w/connection`)
    .then(res=>{
        setConnected(res.data?.data)
    })
    .catch(err=>{
        console.log(err?.message)
    })

    return () => eventSource.close();
  },[])

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const openIssueModal = (issue) => {
    setSelectedIssue(issue)
    setIsModalOpen(true)
  }

  const closeIssueModal = () => {
    setSelectedIssue(null)
    setIsModalOpen(false)
  }

  const calculateDuration = (startDate, endDate) => {
    if (!endDate) return "Ongoing"
    const diff = endDate - startDate
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ${hours % 24} hour${(hours % 24) > 1 ? "s" : ""}`
    }
    return `${hours} hour${hours > 1 ? "s" : ""}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <WhatsAppIcon />
              <h1 className="text-xl font-semibold text-gray-900">WhatsApp Issue Dashboard</h1>
            </div>
            <div className=" flex items-center space-x-3 ">
              <p className="text-sm font-semibold" >{connected ? '🟢 Connected' : '🔴 Disconnected' }</p>
              <Link className="text-xl font-semibold text-gray-900 hover:bg-gray-100 hover:rounded-4xl p-2" to={'/settings'} >{<SettingsIcon />}</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Analytics Overview</h2>
            <select
              value={filters?.group}
              onChange={(e) => handleFilterChange('group',e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Groups</option>
              {groups.map((group) => (
                <option key={group?.id} value={group?.id}>
                  {group?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm ">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChartIcon />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics?.totalIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm ">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ExclamationIcon />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-semibold text-red-600">{analytics?.criticalIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm ">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <IssueIcon />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Issues</p>
                  <p className="text-2xl font-semibold text-orange-600">{analytics?.openIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm ">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckIcon />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                  <p className="text-2xl font-semibold text-green-600">{analytics?.resolvedIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm ">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ClockIcon />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-semibold text-purple-600">{getAvgResolution(analytics?.avgResolution)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm  mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FilterIcon />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={filters.group}
              onChange={(e) => handleFilterChange("group", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Groups</option>
              {groups.map((group) => (
                <option key={group?.id} value={group?.id}>
                  {group?.name}
                </option>
              ))}
            </select>

            {/* <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select> */}

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className="ml-auto text-sm text-gray-500">
              Showing {issues.length*currentPage} of {analytics.totalIssues} issues
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-lg shadow-sm  overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Issues</h3>
          </div>

          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue) => (
                  <tr
                    key={issue?.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    onClick={() => openIssueModal(issue)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{issue?.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={issue?.description}>
                        {issue.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue?.status?.toLowerCase())}`}
                      >
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue?.priority?.toLowerCase())}`}
                      >
                        {issue?.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue?.assignee}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{issue?.team_name}</div>
                      <div className="text-xs text-gray-500">{issue?.whatsapp_group_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(new Date(issue?.created_at))?.toLocaleString() || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {issues.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No issues found matching the current filters.</div>
            </div>
          )}
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {Math.ceil(analytics?.totalIssues/page_size)}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={()=>setCurrentPage(prev=>prev-1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-medium border rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={()=>setCurrentPage(prev=>prev+1)}
              disabled={currentPage === Math.ceil(analytics?.totalIssues/page_size)}
              className={`px-4 py-2 text-sm font-medium border rounded-md ${
                currentPage === Math.ceil(analytics?.totalIssues/page_size)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Issue Detail Modal */}
        {isModalOpen && selectedIssue && (
            <IssueDetails selectedIssue={selectedIssue} closeIssueModal={closeIssueModal} />
        )}
      </div>
    </div>
  )
}

export default Dashboard
