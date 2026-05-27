import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { materialService } from '../../services/materialService'
import { Upload, FileText, ArrowLeft, Calendar, File } from 'lucide-react'

export const MaterialList = () => {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (subjectId) {
      fetchMaterials()
    }
  }, [subjectId])

  const fetchMaterials = async () => {
    try {
      const response = await materialService.getTeacherMaterials(subjectId)
      setMaterials(response.data || [])
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
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
            <p className="text-muted-foreground text-sm font-medium">Manage and review study resources for this subject</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl h-10 border-border/60 hover:bg-accent/80 font-semibold text-xs"
              onClick={() => navigate(`/teacher/subjects/${subjectId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button 
              className="rounded-xl h-10 shadow-premium hover-glow active-pulse font-semibold text-xs"
              onClick={() => navigate(`/teacher/subjects/${subjectId}/materials/upload`)}
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Upload Material
            </Button>
          </div>
        </div>

        {materials.length === 0 ? (
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl">
            <CardContent className="py-16 text-center space-y-4">
              <FileText className="h-14 w-14 text-muted-foreground/60 mx-auto animate-bounce-soft" />
              <div className="space-y-1">
                <p className="text-lg font-bold font-outfit text-foreground">No materials uploaded yet</p>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Click "Upload Material" above to share lecture slides, worksheets, or assignments with your classroom.</p>
              </div>
              <Button 
                onClick={() => navigate(`/teacher/subjects/${subjectId}/materials/upload`)}
                className="rounded-xl px-6 py-2 shadow-premium hover-glow active-pulse"
              >
                Upload First Material
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="text-lg font-bold font-outfit text-foreground">Uploaded Documents</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-medium">Verify standard-compliant lectures, handouts, or slide files</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground pl-6">Resource Title</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Type</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Date Uploaded</TableHead>
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
