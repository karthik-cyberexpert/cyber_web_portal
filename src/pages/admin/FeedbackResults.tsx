
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { API_BASE_URL } from '@/lib/api-config';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

// Lovely color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function FeedbackResults() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    // Fetch Results
    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/feedback/${id}/results`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to fetch results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id, token]);

    if (loading) return <div className="p-8">Loading results...</div>;
    if (!data) return <div className="p-8">Feedback not found or error loading data.</div>;

    const { form, questions, respondents, stats, studentAnswers } = data;
    const totalResponses = respondents.length;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/feedback')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{form.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <Badge variant="outline">{form.type}</Badge>
                        <span>•</span>
                        <span>{form.batch_name || 'All Batches'}</span>
                        <span>•</span>
                        <span>{form.section_name || 'All Sections'}</span>
                        <span>•</span>
                        <span>Closed: {new Date(form.closing_date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{totalResponses}</div>
                    </CardContent>
                 </Card>
                 {form.type === 'faculty' && (
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Target Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="text-2xl font-semibold">Faculty Evaluation</div>
                        </CardContent>
                     </Card>
                 )}
            </div>

            <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="analysis">
                        <PieChartIcon className="w-4 h-4 mr-2"/>
                        Analysis
                    </TabsTrigger>
                    <TabsTrigger value="individual">
                        <User className="w-4 h-4 mr-2"/>
                        Individual Responses
                    </TabsTrigger>
                </TabsList>
                
                {/* Tab: Analysis */}
                <TabsContent value="analysis" className="space-y-6 mt-6">
                    {questions.map((q: any, idx: number) => {
                        // Prepare data for recharts
                        const questionStats = stats[q.id] || {};
                        const chartData = Object.entries(questionStats).map(([name, value]) => ({
                            name,
                            value
                        }));

                        return (
                            <Card key={q.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <CardTitle className="text-base font-medium flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                                            {idx + 1}
                                        </span>
                                        {q.question_text}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {chartData.length > 0 ? (
                                        <div className="flex justify-center items-center">
                                            {/* Pie Chart Only */}
                                            <div className="h-[350px] w-full max-w-[500px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={chartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={true}
                                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                            outerRadius={120}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend verticalAlign="bottom" height={36}/>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-24 flex items-center justify-center text-muted-foreground">
                                            No responses yet
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </TabsContent>

                {/* Tab: Individual */}
                <TabsContent value="individual" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Respondent List</CardTitle>
                            <CardDescription>Click on a student to view their detailed feedback.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Roll Number</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Submitted At</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {respondents.map((r: any) => (
                                        <TableRow 
                                            key={r.user_id} 
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => setSelectedStudent(r)}
                                        >
                                            <TableCell className="font-medium">{r.name}</TableCell>
                                            <TableCell>{r.roll_number}</TableCell>
                                            <TableCell className="text-muted-foreground">{r.email}</TableCell>
                                            <TableCell>{new Date(r.submitted_at).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline">View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {respondents.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No responses yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                </TabsContent>
            </Tabs>

            {/* Individual Student Response Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex gap-2 items-center">
                            <User className="w-5 h-5"/>
                            {selectedStudent?.name}'s Feedback
                        </DialogTitle>
                        <CardDescription>
                            Roll No: {selectedStudent?.roll_number} • Submitted: {selectedStudent && new Date(selectedStudent.submitted_at).toLocaleString()}
                        </CardDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {selectedStudent && questions.map((q: any, idx: number) => {
                            const answer = studentAnswers[selectedStudent.user_id]?.[q.id];
                            return (
                                <div key={q.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <p className="font-medium text-sm mb-2 text-muted-foreground">Question {idx + 1}</p>
                                    <p className="font-semibold mb-2">{q.question_text}</p>
                                    <div className="bg-muted/50 p-3 rounded-md text-sm border-l-4 border-primary">
                                       {answer || <span className="text-muted-foreground italic">No answer provided</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
