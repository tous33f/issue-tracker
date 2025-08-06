
import axios from "axios"
import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router"

import {ChartIcon,CheckIcon,ClockIcon,ExclamationIcon,FilterIcon,IssueIcon,SettingsIcon,WhatsAppIcon} from "../constants/icons.jsx"
import { getAvgResolution, getPriorityColor,getStatusColor } from "../constants/helpers.jsx"
import { IssueDetails } from "../components/IssueDetails.jsx"

function Dashboard() {

    useEffect(()=>{

        const fetchData=()=>{
            axios.get(`/api/a/issues`)
            .then(res=>{
                setIssues(res.data?.data)
            })
            .catch(err=>{
                console.log(err?.message)
            })

            axios.get(`/api/a/issues/analytics`)
            .then(res=>{
                setAnalytics(res.data?.data)
            })
            .catch(err=>{
                console.log(err?.message)
            })
        }

        fetchData()

        const eventSource = new EventSource("/api/events");

        eventSource.onmessage = (event) => {
            const {message} = JSON.parse(event.data);
            console.log(message)
            if(message=='get'){
                fetchData()
            }
        };

        eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        eventSource.close();
        };

        return () => eventSource.close();

    },[])

  const [issues,setIssues] = useState([])
  const [filters, setFilters] = useState({
    group: "all",
    priority: "all",
    status: "all",
  })
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [analytics,setAnalytics]=useState({totalIssues:0,criticalIssues:0,openIssues:0,resolvedIssues:0,avgResolution:0 })

  // Get unique values for filters
  const groups = [...new Set(issues.map((issue) => issue.groupName))]
  const priorities = [...new Set(issues.map((issue) => issue.priority))]
  const statuses = [...new Set(issues.map((issue) => issue.status))]

  // Filter issues based on current filters
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      return (
        (filters.group === "all" || issue.groupName === filters.group) &&
        (filters.priority === "all" || issue.priority === filters.priority) &&
        (filters.status === "all" || issue.status === filters.status)
      )
    })
  }, [issues, filters])

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <WhatsAppIcon />
              <h1 className="text-xl font-semibold text-gray-900">WhatsApp Issue Dashboard</h1>
            </div>
            <div className="text-xl font-semibold text-gray-900 hover:bg-gray-100 hover:rounded-4xl p-2">
                <Link to={'/settings'} >{<SettingsIcon />}</Link>
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
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Groups</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
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

            <div className="bg-white p-6 rounded-lg shadow-sm border">
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

            <div className="bg-white p-6 rounded-lg shadow-sm border">
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

            <div className="bg-white p-6 rounded-lg shadow-sm border">
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

            <div className="bg-white p-6 rounded-lg shadow-sm border">
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
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
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
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <select
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
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className="ml-auto text-sm text-gray-500">
              Showing {filteredIssues.length} of {issues.length} issues
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
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
                {filteredIssues.map((issue) => (
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

          {filteredIssues.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No issues found matching the current filters.</div>
            </div>
          )}
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
