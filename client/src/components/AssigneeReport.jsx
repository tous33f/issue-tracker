import axios from "axios";
import { UserIcon } from "../constants/icons";
import { useEffect, useState } from "react";
import { getAvgResolution } from "../constants/helpers";

export const AssigneeReport = () => {

    const filters=[
        {id: 'day',name:'Last 24 hours'} ,{id: 'week',name:'Last 7 days'}, {id: 'month',name:'Last 30 days'}
    ]
    const [curFilter,setCurFilter]=useState(filters[0])

    const handleFilterChange=(value)=>{
        setCurFilter(value)
        axios.get(`/api/a/assignee/analytics?filter=${value}`)
        .then((res)=>{
            setAssignees(res?.data?.data)
        })
        .catch(err=>console.log(err?.message))
    }

    const [assignees,setAssignees]=useState([])
    useEffect(()=>{
        axios.get(`/api/a/assignee/analytics`)
        .then((res)=>{
            setAssignees(res?.data?.data)
        })
        .catch(err=>console.log(err?.message))
    },[])

    return (
        <div className="bg-white rounded-lg shadow-sm  mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Assignee Report</h2>
                <p className="text-sm text-gray-500 mt-1">Issues resolved by assignees</p>
            </div>
            <select
              value={curFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filters.map((filter) => (
                <option key={filter?.id} value={filter?.id}>
                  {filter?.name}
                </option>
              ))}
            </select>
            </div>
        </div>

        <div className="overflow-x-auto">
            {assignees.length === 0 ? (
            <div className="text-center py-12">
                <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">No Data found</h3>
                </div>
            </div>
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues Resolved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Resolution Time</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {assignees.map((assignee) => (
                    <tr key={assignee.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <UserIcon />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{assignee.assignee}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{assignee?.issuesResolved}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{getAvgResolution(assignee?.avgResolution)}</div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
        </div>
    );
};
