import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import useVideos, { VideoType } from "@/hooks/useVideos";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const AdminVideos = () => {
  const { fetchVideos, addVideo, updateVideo, deleteVideo, loading } = useVideos();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    const loadVideos = async () => {
      const result = await fetchVideos();
      setVideos(result);
    };
    
    loadVideos();
  }, [fetchVideos]);

  const handleAddVideo = async () => {
    if (!title || !url) {
      toast.error("Title and URL are required");
      return;
    }

    const newVideo: Omit<VideoType, 'id' | 'created_at' | 'updated_at'> = {
      title,
      description,
      category,
      duration,
      author,
      url,
      thumbnail_url: thumbnailUrl,
      views: 0
    };

    const addedVideo = await addVideo(newVideo);
    if (addedVideo) {
      setVideos([...videos, addedVideo]);
      setIsAddingVideo(false);
      setTitle("");
      setDescription("");
      setCategory("");
      setDuration("");
      setAuthor("");
      setUrl("");
      setThumbnailUrl("");
      toast.success("Video added successfully!");
    } else {
      toast.error("Failed to add video.");
    }
  };

  const handleUpdateVideo = async (id: string) => {
    if (!title || !url) {
      toast.error("Title and URL are required");
      return;
    }

    const updates: Partial<VideoType> = {
      title,
      description,
      category,
      duration,
      author,
      url,
      thumbnail_url: thumbnailUrl
    };

    const updatedVideo = await updateVideo(id, updates);
    if (updatedVideo) {
      setVideos(
        videos.map((video) => (video.id === id ? updatedVideo : video))
      );
      setIsEditingVideo(null);
      setTitle("");
      setDescription("");
      setCategory("");
      setDuration("");
      setAuthor("");
      setUrl("");
      setThumbnailUrl("");
      toast.success("Video updated successfully!");
    } else {
      toast.error("Failed to update video.");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?"
    );
    if (confirmDelete) {
      const success = await deleteVideo(id);
      if (success) {
        setVideos(videos.filter((video) => video.id !== id));
        toast.success("Video deleted successfully!");
      } else {
        toast.error("Failed to delete video.");
      }
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Manage Videos</h1>
          <Button onClick={() => setIsAddingVideo(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Video
          </Button>
        </div>
        <Separator className="mb-4" />

        {isAddingVideo && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Add New Video</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    type="text"
                    id="thumbnailUrl"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    type="text"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    type="text"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    type="text"
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setIsAddingVideo(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddVideo}>Add Video</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card key={video.id}>
              <CardHeader>
                <CardTitle>{video.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingVideo === video.id ? (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${video.id}`}>Title</Label>
                        <Input
                          type="text"
                          id={`title-${video.id}`}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`url-${video.id}`}>URL</Label>
                        <Input
                          type="text"
                          id={`url-${video.id}`}
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`thumbnailUrl-${video.id}`}>
                          Thumbnail URL
                        </Label>
                        <Input
                          type="text"
                          id={`thumbnailUrl-${video.id}`}
                          value={thumbnailUrl}
                          onChange={(e) => setThumbnailUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`duration-${video.id}`}>Duration</Label>
                        <Input
                          type="text"
                          id={`duration-${video.id}`}
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`category-${video.id}`}>Category</Label>
                        <Input
                          type="text"
                          id={`category-${video.id}`}
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`author-${video.id}`}>Author</Label>
                        <Input
                          type="text"
                          id={`author-${video.id}`}
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`description-${video.id}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`description-${video.id}`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditingVideo(null)}
                        className="mr-2"
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => handleUpdateVideo(video.id)}>
                        Update Video
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>
                      <strong>Category:</strong> {video.category || "N/A"}
                    </p>
                    <p>
                      <strong>Author:</strong> {video.author || "N/A"}
                    </p>
                    <p>
                      <strong>Views:</strong> {video.views || 0}
                    </p>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsEditingVideo(video.id);
                          setTitle(video.title);
                          setDescription(video.description || "");
                          setCategory(video.category || "");
                          setDuration(video.duration || "");
                          setAuthor(video.author || "");
                          setUrl(video.url);
                          setThumbnailUrl(video.thumbnail_url || "");
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminVideos;
