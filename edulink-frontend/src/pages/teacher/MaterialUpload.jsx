import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { materialService } from '../../services/materialService'
import toast from 'react-hot-toast'
import { ArrowLeft, Upload, FileUp, File, AlertCircle } from 'lucide-react'

export const MaterialUpload = () => {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    file: null,
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      const selectedFile = e.target.files[0]
      if (selectedFile) {
        setFormData((prev) => ({ ...prev, file: selectedFile }))
        if (!formData.title) {
          // Auto-fill title with filename (without extension)
          const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name
          setFormData((prev) => ({ ...prev, title: nameWithoutExt }))
        }
      }
    } else {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter material title')
      return
    }
    if (!formData.file) {
      toast.error('Please select a file')
      return
    }
    
    const maxSize = 50 * 1024 * 1024
    if (formData.file.size > maxSize) {
      toast.error('File size exceeds 50MB limit')
      return
    }

    setLoading(true)

    try {
      const response = await materialService.uploadMaterial(
        subjectId,
        formData.title,
        formData.file
      )
      toast.success(response.message || 'Material uploaded successfully')
      navigate(`/teacher/subjects/${subjectId}/materials`)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload material'
      toast.error(errorMsg)
      console.error('Error uploading material:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl h-9.5 w-9.5 border-border/60 hover:bg-accent/80"
            onClick={() => navigate(`/teacher/subjects/${subjectId}/materials`)}
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-foreground">Upload Material</h1>
            <p className="text-muted-foreground text-sm font-medium">Add a new study guide or document resource</p>
          </div>
        </div>

        <Card className="border border-border/40 bg-card shadow-premium rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <CardTitle className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Study Resource
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-medium">Provide a clean title and select your document (PDF, Word, Slides)</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold text-foreground/80">Resource Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Lecture Notes - Week 1"
                  value={formData.title}
                  onChange={handleChange}
                  className="rounded-xl border-border bg-background/50 focus:bg-background transition-all"
                  required
                  disabled={loading}
                />
              </div>

              {/* Drag-and-Drop Dropzone look */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground/80">Resource File</Label>
                <div className="relative border-2 border-dashed border-border/80 hover:border-primary/40 rounded-2xl p-8 text-center bg-muted/10 transition-colors flex flex-col items-center justify-center group">
                  <input
                    id="file"
                    name="file"
                    type="file"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                    disabled={loading}
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                  />
                  
                  {formData.file ? (
                    <div className="space-y-2 animate-scale-up">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <File className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-foreground truncate max-w-md mx-auto">{formData.file.name}</p>
                        <p className="text-xs text-muted-foreground">{(formData.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <span className="inline-block text-[10px] uppercase font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded">Selected</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="h-12 w-12 rounded-xl bg-muted border flex items-center justify-center text-muted-foreground mx-auto group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        <FileUp className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">Click to upload or drag & drop</p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">Supported: PDF, DOC, DOCX, TXT, PPT, PPTX (Max 50MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/teacher/subjects/${subjectId}/materials`)}
                  className="rounded-xl h-10 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl h-10 px-5 font-semibold text-xs shadow-premium hover-glow active-pulse">
                  {loading ? <LoadingSpinner size="sm" /> : (
                    <>
                      <Upload className="h-4 w-4 mr-1.5" />
                      Upload Material
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
