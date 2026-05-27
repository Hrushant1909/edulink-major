import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { materialService } from '../../services/materialService'
import toast from 'react-hot-toast'
import { Download, ArrowLeft, FileText, Calendar, File } from 'lucide-react'

export const MaterialList = () => {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    if (subjectId) {
      fetchMaterials()
    }
  }, [subjectId])

  const fetchMaterials = async () => {
    try {
      const response = await materialService.getStudentMaterials(subjectId)
      setMaterials(response.data || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch materials')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (materialId, title, fileType) => {
    setDownloading(materialId)
    try {
      const blob = await materialService.downloadMaterial(materialId)
      
      const extension = fileType || 'pdf'
      const fileName = title 
        ? `${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
        : `material_${materialId}.${extension}`
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Download started')
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to download material'
      toast.error(errorMsg)
      console.error('Error downloading material:', error)
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFileBadgeStyle = (fileType) => {
    const type = fileType?.toLowerCase() || ''
    if (type.includes('pdf')) return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    if (type.includes('doc')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    if (type.includes('ppt')) return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    if (type.includes('xls')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-foreground">Study Materials</h1>
            <p className="text-muted-foreground text-sm font-medium">Download classroom resources and lectures uploaded by your teacher</p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl h-10 border-border/60 hover:bg-accent/80 font-semibold text-xs"
            onClick={() => navigate('/student/enrolled')}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Enrollments
          </Button>
        </div>

        {materials.length === 0 ? (
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl">
            <CardContent className="py-16 text-center space-y-4">
              <FileText className="h-14 w-14 text-muted-foreground/60 mx-auto animate-bounce-soft" />
              <div className="space-y-1">
                <p className="text-lg font-bold font-outfit text-foreground font-outfit">No materials available</p>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Your teacher hasn't uploaded any study materials or assignments for this subject yet.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="text-lg font-bold font-outfit text-foreground">Available Materials</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-medium">Download active lectures, handouts, or slide files</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground pl-6">Resource Title</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Type</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Date Uploaded</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground text-right pr-6">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id} className="hover:bg-muted/10 transition-colors group">
                      <TableCell className="font-bold font-outfit text-foreground pl-6 py-4 flex items-center gap-2.5">
                        <div className="h-8.5 w-8.5 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform flex-shrink-0">
                          <File className="h-4 w-4" />
                        </div>
                        <span className="truncate">{material.title}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getFileBadgeStyle(material.fileType)}`}>
                          {material.fileType || 'FILE'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>{formatDate(material.uploadDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-xs h-8 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all hover-glow active-pulse font-semibold"
                          onClick={() => handleDownload(material.id, material.title, material.fileType)}
                          disabled={downloading === material.id}
                        >
                          {downloading === material.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Download
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
