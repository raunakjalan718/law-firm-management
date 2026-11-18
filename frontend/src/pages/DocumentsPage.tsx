import { useEffect, useState } from 'react'
import { Upload, Trash2, Download, Search, FileText } from 'lucide-react'
import { deleteDocument, getDocuments, uploadDocument, downloadDocument, getClients, getCases } from '../api'
import type { DocumentItem, Client, CaseItem } from '../types'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [cases, setCases] = useState<CaseItem[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [clientId, setClientId] = useState<number>(0)
  const [caseId, setCaseId] = useState<number>(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [docsRes, clientsRes, casesRes] = await Promise.all([
        getDocuments(),
        getClients(),
        getCases()
      ])
      setDocuments(docsRes.data)
      setClients(clientsRes.data)
      setCases(casesRes.data)
      if (clientsRes.data.length > 0 && clientId === 0) {
        setClientId(clientsRes.data[0].id)
      }
      setError(null)
    } catch (err) {
      setError('Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload.')
      return
    }
    if (!clientId) {
      setError('Please select a client for this document.')
      return
    }

    setUploading(true)
    setError(null)

    const form = new FormData()
    form.append('file', file)
    form.append('clientId', String(clientId))
    if (caseId && caseId > 0) {
      form.append('caseId', String(caseId))
    }
    const loggedUser = localStorage.getItem('user_email') || 'admin@lawfirm.com'
    form.append('uploadedBy', loggedUser)

    try {
      await uploadDocument(form)
      setFile(null)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document. File may exceed size limit or format not supported.')
    } finally {
      setUploading(false)
    }
  }

  const remove = async (id: number) => {
    if (window.confirm('Delete this document? The file will be permanently removed.')) {
      try {
        await deleteDocument(id)
        await loadData()
      } catch (err) {
        alert('Failed to delete document.')
      }
    }
  }

  const handleDownload = async (doc: DocumentItem) => {
    try {
      await downloadDocument(doc.id, doc.originalName)
    } catch (err) {
      alert('Failed to download document.')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const filtered = documents.filter(doc =>
    doc.originalName.toLowerCase().includes(search.toLowerCase()) ||
    doc.mimeType.toLowerCase().includes(search.toLowerCase()) ||
    (doc.uploadedBy && doc.uploadedBy.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Legal Documents</h2>
        <p className="text-sm text-slate-500">Secure document storage, evidence uploads, and filings</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <form className="card lg:col-span-1 space-y-4 h-fit" onSubmit={submit}>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-3">
            <Upload size={18} className="text-blue-600" />
            Upload New Document
          </h3>

          <div>
            <label className="label">Select File *</label>
            <input
              id="file-upload"
              required
              type="file"
              className="input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="mt-1 text-[11px] text-slate-400">PDF, Word docs, Excel, text, and images up to 10MB</p>
          </div>

          <div>
            <label className="label">Associated Client *</label>
            <select
              required
              className="input text-sm"
              value={clientId}
              onChange={(e) => setClientId(Number(e.target.value))}
            >
              <option value={0} disabled>Select client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Associated Case (Optional)</label>
            <select
              className="input text-sm"
              value={caseId}
              onChange={(e) => setCaseId(Number(e.target.value))}
            >
              <option value={0}>None / General Client File</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2" type="submit" disabled={uploading}>
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>

        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-slate-50">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent text-sm outline-none w-full"
              placeholder="Search documents by name, type, or uploader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-2">Document</th>
                  <th className="px-2">Size</th>
                  <th className="px-2">Uploaded</th>
                  <th className="text-right px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">Loading documents...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      {search ? 'No documents match your search' : 'No documents uploaded yet'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-blue-500 shrink-0" />
                          <div>
                            <div className="font-medium text-slate-900 truncate max-w-xs">{doc.originalName}</div>
                            <div className="text-xs text-slate-400">{doc.mimeType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 text-slate-600 text-xs font-mono">{formatSize(doc.fileSize)}</td>
                      <td className="px-2 text-xs text-slate-500">
                        <div>{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                        <div className="text-[11px] text-slate-400">by {doc.uploadedBy}</div>
                      </td>
                      <td className="text-right px-2 space-x-1 whitespace-nowrap">
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-blue-600"
                          onClick={() => handleDownload(doc)}
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-red-600"
                          onClick={() => remove(doc.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
