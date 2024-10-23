"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biscuitBuddyFormSchema } from "@/lib/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import jsPDF from "jspdf"
import "jspdf-autotable"

type FormValues = z.infer<typeof biscuitBuddyFormSchema>;

export default function Home() {
  const [invoices, setInvoices] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(biscuitBuddyFormSchema),
    defaultValues: {
      total_money: 0,
      total_team_members: 0,
      team_members: [],
      date: new Date(),
    },
  });

  const totalTeamMembers = form.watch("total_team_members");
  const teamMembers = form.watch("team_members");

  const calculateShares = (values: FormValues) => {
    const calculatedShares = values.team_members.map((member) => {
      const share = values.total_money / values.total_team_members;
      return share - member.advancedPayment;
    });

    const generatedInvoices = values.team_members.map((member, index) => ({
      name: member.name,
      advancedPayment: member.advancedPayment,
      share: calculatedShares[index],
      date: values.date,
    }));

    setInvoices(generatedInvoices);
  };

  const updateTeamMembers = (totalMembers: number) => {
    const newTeamMembers = Array(totalMembers)
      .fill(null)
      .map(() => ({ name: "", advancedPayment: 0 }));
    form.setValue("team_members", newTeamMembers);
  };

  const generateInvoicePDF = (invoice: any) => {
    const pdf = new jsPDF();
  
    // Set background color
    pdf.setFillColor(255, 248, 225);
    pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, 'F');
  
    // Add logo, center-aligned
    pdf.addImage("/logo1.png", "PNG", pdf.internal.pageSize.width / 2 - 25, 20, 50, 25); // Center logo
  
    // Add title
    pdf.setFontSize(28);
    pdf.setTextColor(245, 158, 11); // amber-500
    pdf.setFont("helvetica", "bold");
    pdf.text("Biscuit Buddy Invoice", pdf.internal.pageSize.width / 2, 60, { align: "center" });
  
    // Add horizontal line separator
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(245, 158, 11);
    pdf.line(20, 65, pdf.internal.pageSize.width - 20, 65);
  
    // Add invoice details
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Name: ${invoice.name}`, 20, 80);
    pdf.text(`Date: ${format(invoice.date, "PPP")}`, 20, 90);
  
    // Adjust table styling
    (pdf as any).autoTable({
      startY: 110,
      head: [["Description", "Amount"]],
      body: [
        ["Advanced Payment", `₹${invoice.advancedPayment.toFixed(2)}`],
        ["Share", `₹${invoice.share.toFixed(2)}`],
        ["Total Due", `₹${Math.max(0, invoice.share).toFixed(2)}`],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [245, 158, 11], // Amber
        textColor: [255, 255, 255],
        halign: 'center', // Center the headers
        fontSize: 12,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 12,
        halign: 'center', // Center the body text
      },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      margin: { left: 20, right: 20 },
      tableWidth: 'wrap', // Adjust to content width
    });
  
    // Add footer with centered text
    pdf.setFontSize(12);
    pdf.setTextColor(245, 158, 11);
    pdf.text("Thank you for using Biscuit Buddy!", pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 30, { align: "center" });
  
    // Save the PDF
    pdf.save(`${invoice.name}_invoice.pdf`);
  };
  

  return (
    <div className="min-h-screen bg-amber-50 py-6 px-4 flex flex-col justify-center sm:py-12">
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-white shadow-lg rounded-3xl overflow-hidden">
          <div className="bg-amber-200 p-6 flex justify-center items-center">
            <Image
              src="/logo1.png"
              alt="Biscuit Buddy Logo"
              width={150}
              height={75}
              className="max-w-full h-auto"
            />
          </div>
          <div className="p-6 sm:p-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(calculateShares)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="total_money"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Biscuit Money</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter amount"
                            type="number"
                            className="w-full"
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(isNaN(value) ? "" : value);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs m-0 p-0" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_team_members"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Team Members</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter number"
                            type="number"
                            min="1"
                            step="1"
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(isNaN(value) ? "" : value);
                              updateTeamMembers(isNaN(value) ? 0 : value);
                            }}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs m-0 p-0" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Team Members List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {teamMembers &&
                    teamMembers.map((member, index) => (
                      <div key={index} className="bg-amber-50 p-4 rounded-lg">
                        <FormLabel className="text-lg font-semibold mb-2 block">
                          Team Member {index + 1}
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name={`team_members.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="mb-2">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Name"
                                  type="text"
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs m-0 p-0" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`team_members.${index}.advancedPayment`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Advanced Payment"
                                  type="number"
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs m-0 p-0" />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Calculate Shares and Generate Invoices
                </Button>
              </form>
            </Form>

            {invoices.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Invoices</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {invoices.map((invoice, index) => (
                    <div
                      key={index}
                      className="bg-white border border-amber-200 rounded-lg p-6 shadow-md"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">
                          {invoice.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {format(invoice.date, "PPP")}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="flex justify-between">
                          <span>Advanced Payment:</span>
                          <span className="font-medium">
                            ₹{invoice.advancedPayment.toFixed(2)}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span>Share:</span>
                          <span className="font-medium">
                            ₹{invoice.share.toFixed(2)}
                          </span>
                        </p>
                        <div className="border-t border-amber-200 pt-2 mt-2">
                          <p className="flex justify-between font-bold">
                            <span>Total Due:</span>
                            <span>
                              ₹{Math.max(0, invoice.share).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => generateInvoicePDF(invoice)}
                        className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        <Download className="mr-2 h-4 w-4" /> Generate Invoice
                        PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
