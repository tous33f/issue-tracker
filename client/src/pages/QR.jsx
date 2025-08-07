
import { useState, useEffect } from "react"
import QRCode from "react-qr-code"

// QR Code SVG Component (simplified representation)
const QRCodePlaceholder = () => (
  <svg className="w-64 h-64" viewBox="0 0 256 256" fill="none">
    {/* QR Code pattern simulation */}
    <rect width="256" height="256" fill="white" stroke="#e5e7eb" strokeWidth="2" />
    
    {/* Corner squares */}
    <rect x="8" y="8" width="56" height="56" fill="black" />
    <rect x="16" y="16" width="40" height="40" fill="white" />
    <rect x="24" y="24" width="24" height="24" fill="black" />
    
    <rect x="192" y="8" width="56" height="56" fill="black" />
    <rect x="200" y="16" width="40" height="40" fill="white" />
    <rect x="208" y="24" width="24" height="24" fill="black" />
    
    <rect x="8" y="192" width="56" height="56" fill="black" />
    <rect x="16" y="200" width="40" height="40" fill="white" />
    <rect x="24" y="208" width="24" height="24" fill="black" />
    
    {/* Data pattern simulation */}
    <rect x="80" y="16" width="8" height="8" fill="black" />
    <rect x="96" y="16" width="8" height="8" fill="black" />
    <rect x="112" y="16" width="8" height="8" fill="black" />
    <rect x="144" y="16" width="8" height="8" fill="black" />
    <rect x="160" y="16" width="8" height="8" fill="black" />
    
    <rect x="80" y="32" width="8" height="8" fill="black" />
    <rect x="112" y="32" width="8" height="8" fill="black" />
    <rect x="128" y="32" width="8" height="8" fill="black" />
    <rect x="160" y="32" width="8" height="8" fill="black" />
    
    <rect x="96" y="48" width="8" height="8" fill="black" />
    <rect x="128" y="48" width="8" height="8" fill="black" />
    <rect x="144" y="48" width="8" height="8" fill="black" />
    
    <rect x="80" y="80" width="8" height="8" fill="black" />
    <rect x="112" y="80" width="8" height="8" fill="black" />
    <rect x="144" y="80" width="8" height="8" fill="black" />
    <rect x="176" y="80" width="8" height="8" fill="black" />
    
    <rect x="96" y="96" width="8" height="8" fill="black" />
    <rect x="128" y="96" width="8" height="8" fill="black" />
    <rect x="160" y="96" width="8" height="8" fill="black" />
    <rect x="192" y="96" width="8" height="8" fill="black" />
    
    <rect x="80" y="112" width="8" height="8" fill="black" />
    <rect x="144" y="112" width="8" height="8" fill="black" />
    <rect x="176" y="112" width="8" height="8" fill="black" />
    
    <rect x="112" y="128" width="8" height="8" fill="black" />
    <rect x="128" y="128" width="8" height="8" fill="black" />
    <rect x="160" y="128" width="8" height="8" fill="black" />
    <rect x="192" y="128" width="8" height="8" fill="black" />
    
    <rect x="96" y="144" width="8" height="8" fill="black" />
    <rect x="144" y="144" width="8" height="8" fill="black" />
    <rect x="176" y="144" width="8" height="8" fill="black" />
    
    <rect x="80" y="160" width="8" height="8" fill="black" />
    <rect x="112" y="160" width="8" height="8" fill="black" />
    <rect x="128" y="160" width="8" height="8" fill="black" />
    <rect x="192" y="160" width="8" height="8" fill="black" />
    
    <rect x="96" y="176" width="8" height="8" fill="black" />
    <rect x="160" y="176" width="8" height="8" fill="black" />
    <rect x="176" y="176" width="8" height="8" fill="black" />
    
    <rect x="80" y="208" width="8" height="8" fill="black" />
    <rect x="112" y="208" width="8" height="8" fill="black" />
    <rect x="144" y="208" width="8" height="8" fill="black" />
    <rect x="176" y="208" width="8" height="8" fill="black" />
    
    <rect x="96" y="224" width="8" height="8" fill="black" />
    <rect x="128" y="224" width="8" height="8" fill="black" />
    <rect x="160" y="224" width="8" height="8" fill="black" />
    <rect x="192" y="224" width="8" height="8" fill="black" />
    
    <rect x="80" y="240" width="8" height="8" fill="black" />
    <rect x="112" y="240" width="8" height="8" fill="black" />
    <rect x="144" y="240" width="8" height="8" fill="black" />
    <rect x="176" y="240" width="8" height="8" fill="black" />
  </svg>
)

// SVG Icons
const WhatsAppIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
)

export const QR=({qr})=> {


  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <WhatsAppIcon />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Login</h1>
          <p className="text-gray-600 text-sm">Scan the QR code with your WhatsApp mobile app</p>
        </div>

        {/* QR Code Section */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* QR Code */}
            <div
              className={`transition-all duration-300`}
            >
              {/* <QRCodePlaceholder /> */}
              {qr && <QRCode value={qr} />}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <h3 className="text-sm font-medium text-gray-900 mb-2">How to scan:</h3>
            <ol className="text-xs text-gray-600 space-y-1">
              <li>1. Open WhatsApp on your phone</li>
              <li>2. Tap Menu (⋮) or Settings</li>
              <li>3. Tap "Linked Devices"</li>
              <li>4. Tap "Link a Device"</li>
              <li>5. Point your phone at this screen</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  )
}
