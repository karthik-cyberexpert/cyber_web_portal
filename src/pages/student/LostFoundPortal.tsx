import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Search } from 'lucide-react';
import { motion } from "framer-motion";
import { API_BASE_URL } from '@/lib/api-config';

interface LostItem {
    id: number;
    item_name: string;
    description: string;
    image_path: string | null;
    student_name: string;
    batch_name: string;
    section_name: string;
    created_at: string;
}

import { useAuth } from "@/contexts/AuthContext";
import { Check } from 'lucide-react';

interface LostItem {
    id: number;
    user_id: number;
    item_name: string;
    description: string;
    image_path: string | null;
    status: 'active' | 'resolved';
    student_name: string;
    batch_name: string;
    section_name: string;
    created_at: string;
}

const LostFoundPortal = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<LostItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/lost-and-found`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkFound = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/lost-and-found/${id}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success("Marked as found!");
                fetchItems();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating status");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 1024 * 1024) { // 1MB
                toast.error("Image size must be less than 1MB");
                e.target.value = ''; // Reset input
                return;
            }
            setImage(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('item_name', itemName);
            formData.append('description', description);
            if (image) {
                formData.append('image', image);
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/lost-and-found`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                toast.success("Item posted successfully!");
                setIsDialogOpen(false);
                // Reset form
                setItemName('');
                setDescription('');
                setImage(null);
                fetchItems(); // Refresh list
            } else {
                toast.error("Failed to post item.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error submitting form.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredItems = items.filter(item => 
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
                    <p className="text-muted-foreground mt-2">Report lost items or check for found belongings.</p>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Find My
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Report Lost Item</DialogTitle>
                            <DialogDescription>
                                Provide details about the item. Image is optional (Max 1MB).
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Item Name</Label>
                                <Input 
                                    id="name" 
                                    value={itemName} 
                                    onChange={(e) => setItemName(e.target.value)} 
                                    required 
                                    placeholder="e.g., Blue Water Bottle"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea 
                                    id="desc" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    required 
                                    placeholder="Describe color, brand, or specific marks..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Image (Optional, Max 1MB)</Label>
                                <Input 
                                    id="image" 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border w-full md:w-1/3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search items..." 
                    className="border-none focus-visible:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No items found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <FlipCard 
                            key={item.id} 
                            item={item} 
                            currentUserId={user?.id} 
                            onMarkFound={handleMarkFound} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FlipCard = ({ item, currentUserId, onMarkFound }: { item: LostItem, currentUserId?: number, onMarkFound: (id: number) => void }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const isOwner = currentUserId === item.user_id;

    // Found Ribbon Overlay
    const FoundOverlay = () => (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
             <div className="bg-success text-success-foreground px-8 py-2 rotate-[-15deg] font-bold text-2xl tracking-wider shadow-lg border-2 border-white/50">
                FOUND
             </div>
        </div>
    );

    // Mark Found Button (stops propagation to prevent flip)
    const MarkFoundButton = () => (
        <div className="absolute top-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
             <Button 
                size="sm" 
                variant="secondary" 
                className="h-8 gap-1 shadow-md bg-white/90 hover:bg-white text-green-600"
                onClick={(e) => {
                    e.stopPropagation();
                    onMarkFound(item.id);
                }}
            >
                <Check className="h-4 w-4" />
                Mark as Found
            </Button>
        </div>
    );

    // If no image, show details directly (no flip interaction needed, or static 'back' face)
    if (!item.image_path) {
        return (
            <Card className={`h-[300px] flex flex-col justify-between p-6 bg-card border shadow-sm relative group ${item.status === 'resolved' ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                {item.status === 'resolved' && <FoundOverlay />}
                {isOwner && item.status === 'active' && <MarkFoundButton />}
                
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-bold">{item.item_name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-4">{item.description}</p>
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <p className="text-sm font-medium">Posted by:</p>
                    <div className="flex items-center justify-between mt-1">
                        <span className="font-semibold">{item.student_name}</span>
                        <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                            {item.batch_name} - {item.section_name}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                        {new Date(item.created_at).toLocaleDateString('en-GB')}
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className={`h-[300px] w-full perspective-1000 cursor-pointer group relative ${item.status === 'resolved' ? 'opacity-80' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
             {item.status === 'resolved' && <FoundOverlay />}
             {isOwner && item.status === 'active' && !isFlipped && <MarkFoundButton />}

             <motion.div
                className="relative w-full h-full transition-all duration-500 preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front Face: Image */}
                <div 
                    className="absolute w-full h-full rounded-xl overflow-hidden shadow-md border bg-card"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <img 
                        src={`${API_BASE_URL}/${item.image_path}`} 
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                    />
                     <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 text-white">
                        <p className="font-bold truncate">{item.item_name}</p>
                        <p className="text-xs opacity-80">Click to see details</p>
                    </div>
                </div>

                {/* Back Face: Details */}
                <div 
                    className="absolute w-full h-full rounded-xl bg-card border shadow-md p-6 flex flex-col justify-between"
                    style={{ 
                        transform: "rotateY(180deg)", 
                        backfaceVisibility: 'hidden', 
                        WebkitBackfaceVisibility: 'hidden' 
                    }}
                >
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold">{item.item_name}</h3>
                            <p className="text-sm text-muted-foreground mt-1 overflow-y-auto max-h-[120px]">{item.description}</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t">
                        <p className="text-sm font-medium">Posted by:</p>
                        <div className="flex items-center justify-between mt-1">
                            <span className="font-semibold">{item.student_name}</span>
                            <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                                {item.batch_name} - {item.section_name}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            {new Date(item.created_at).toLocaleDateString('en-GB')}
                        </p>
                    </div>
                    
                    {/* Add mark found button to back as well if needed, or just front */}
                     {isOwner && item.status === 'active' && (
                        <div className="absolute top-2 right-2">
                             <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkFound(item.id);
                                }}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default LostFoundPortal;
