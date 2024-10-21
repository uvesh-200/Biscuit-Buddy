"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { biscuitBuddyFormSchema } from "@/lib/zod";
import { z } from "zod";
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
import Image from "next/image";

type FormValues = z.infer<typeof biscuitBuddyFormSchema>;

export default function Home() {
  const form = useForm<FormValues>({
    resolver: zodResolver(biscuitBuddyFormSchema),
    defaultValues: {
      // total_money: 0,
      // total_team_members: 0,
      team_members: [],
    },
  });

  const totalTeamMembers = form.watch("total_team_members");
  const teamMembers = form.watch("team_members");

  const calculateShares = (values: FormValues) => {
    // Implement share calculation logic here
    const calculatedShares = values.team_members.map((member) => {
      // Example: Divide total money equally and subtract advancedPayment
      const share = values.total_money / totalTeamMembers;
      return share - member.advancedPayment;
    });
    alert(calculatedShares);
    // You can set the calculated shares to state or use them as needed
  };

  // Update the team members array based on the number of team members
  const updateTeamMembers = (totalMembers: number) => {
    const newTeamMembers = Array(totalMembers)
      .fill(null)
      .map(() => ({ name: "", advancedPayment: 0 }));
    form.setValue("team_members", newTeamMembers); // Update form value for team members
  };

  return (
    <div className="min-h-screen bg-amber-50 py-6 px-4 flex flex-col justify-center sm:py-12">
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-white shadow-lg rounded-3xl overflow-hidden">
          <div className="bg-amber-200 p-6 flex justify-center items-center">
            <Image
              src="/logo.png"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="total_money"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`${form.formState.errors.total_money ? "text-black" : ""}`}>Total Biscuit Money</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter amount"
                            type="number"
                            // min="0"
                            // step="0.01"
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

                {/* Calculate Shares Button */}
                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Calculate Shares
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
