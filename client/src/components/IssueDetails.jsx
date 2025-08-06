
import { CloseIcon,CalendarIcon,ClockIcon,GroupIcon,InfoIcon,UserIcon, } from "../constants/icons"
import { getStatusColor, getPriorityColor, getAvgResolution } from "../constants/helpers"

export const IssueDetails=({selectedIssue,closeIssueModal})=>{
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-500/75 transition-opacity -z-10"
                onClick={closeIssueModal}
              ></div>

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{selectedIssue?.id}</h3>
                    <button
                      onClick={closeIssueModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white px-6 py-4">
                  {/* Title */}
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedIssue.title}</h4>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedIssue.status)}`}
                      >
                        {selectedIssue.status}
                      </span>
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(selectedIssue.priority)}`}
                      >
                        {selectedIssue.priority}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <InfoIcon />
                      <h5 className="ml-2 text-sm font-medium text-gray-700">Description</h5>
                    </div>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedIssue.description}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Assigned To */}
                    <div>
                      <div className="flex items-center mb-2">
                        <UserIcon />
                        <h5 className="ml-2 text-sm font-medium text-gray-700">Assigned To</h5>
                      </div>
                      <p className="text-gray-900">{selectedIssue.assignee}</p>
                    </div>

                    {/* Group Information */}
                    <div>
                      <div className="flex items-center mb-2">
                        <GroupIcon />
                        <h5 className="ml-2 text-sm font-medium text-gray-700">WhatsApp Group</h5>
                      </div>
                      <p className="text-gray-900">{selectedIssue.team_name}</p>
                      <p className="text-sm text-gray-500">{selectedIssue.whatsapp_group_id}</p>
                    </div>

                    {/* Created Date */}
                    <div>
                      <div className="flex items-center mb-2">
                        <CalendarIcon />
                        <h5 className="ml-2 text-sm font-medium text-gray-700">Created</h5>
                      </div>
                      <p className="text-gray-900">{((new Date(selectedIssue?.created_at)).toLocaleString()) || 'N/A'}</p>
                    </div>

                    {/* Resolution Date */}
                    <div>
                      <div className="flex items-center mb-2">
                        <CalendarIcon />
                        <h5 className="ml-2 text-sm font-medium text-gray-700">
                          {selectedIssue.resolvedAt ? "Resolved" : "Status"}
                        </h5>
                      </div>
                      <p className="text-gray-900">
                        {selectedIssue?.resolved_at ? ((new Date(selectedIssue?.resolved_at)).toLocaleString()) : "Not resolved yet"}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <ClockIcon />
                      <h5 className="ml-2 text-sm font-medium text-gray-700">Duration</h5>
                    </div>
                    <p className="text-gray-900">
                      {selectedIssue?.resolved_at?getAvgResolution((selectedIssue?.resolved_at-selectedIssue?.created_at)/1000):'N/A'}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      onClick={closeIssueModal}
                      className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-150"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
    )
}
