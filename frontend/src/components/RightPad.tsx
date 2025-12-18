import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "./ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover"
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    signUpSchema,
    signInSchema,
    userRegisterAPI,
    userLogInAPI
} from "../utils/constants";
import { useState } from "react"
import { toast } from "sonner";
import { LoadingButton } from "./ui/loading-button"
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Separator } from "./ui/separator"
import { useNavigate } from "react-router-dom";

export default function RightPad() {
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const navigate = useNavigate();

    const formSignUp = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            company_name: "",
            currency: "",
            address: "",
            tax_id: "",
            logo_url: "",

        }
    });
    const { reset } = formSignUp;

    const formLogIn = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const onSubmitLogIn = async (values: z.infer<typeof signInSchema>) => {
        setLoading(true)
        const { email, password } = values;
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        console.log('values:', values);

        try {
            const result = await fetch(userLogInAPI, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const json = await result.json().catch(() => ({}));

            if (!result.ok) {
                console.log("LOGIN ERROR:", json);
                toast.error(json?.message || "Invalid credentials");
                return;
            }

            // ✅ store tokens
            localStorage.setItem("accessToken", json.accessToken);
            localStorage.setItem("refreshToken", json.refreshToken);

            // (optional) store user
            localStorage.setItem("user", JSON.stringify(json.data));

            toast.success("Success: Welcome, Login successful!");
            navigate("/dashboard");
            setVisible(true); // or navigate to dashboard
        } catch (error) {
            console.log("Error during login", error);
            toast.error("Server error during login");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitCreateAccount = async (values: z.infer<typeof signUpSchema>) => {
        setLoading(true)
        const { firstName, lastName, email, password, company_name, currency, address, tax_id, logo_url } = values;
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('company_name', company_name);
        formData.append('currency', currency);
        formData.append('address', address);
        formData.append('tax_id', tax_id);
        formData.append('logo_url', logo_url);
        console.log('Form Data:', formData);

        try {
            const payload = {
                email: values.email,
                password: values.password,
                first_name: values.firstName,
                last_name: values.lastName,
                currency: values.currency || "EUR",
                company_name: values.company_name || null,
                address: values.address || null,
                tax_id: values.tax_id || null,
                logo_url: values.logo_url || null,
            };
            // Register new user
            const result = await fetch(userRegisterAPI, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await result.json();

            if (!result.ok) {
                toast.error(json?.message || "Failed: User registration unsuccessful!");
                return;
            }
            // ✅ store tokens
            localStorage.setItem("accessToken", json.accessToken);
            localStorage.setItem("refreshToken", json.refreshToken);
            localStorage.setItem("user", JSON.stringify(json.data));

            reset();
            toast.success("Success: User Registered Successfully!");
            navigate("/dashboard");
            setVisible(true); // or navigate to dashboard
        } catch (error) {
            console.log("Error during registration", error);
            toast.error("Server error during registration");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex flex-1 flex-col items-center justify-start border-l border-black px-6 text-center">
            <Card className="w-full m-6">
                <CardContent className="w-full pt-6 border-2">
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="w-full bg-gray-100 border-gray-200 border-2 gap-4 mb-5">
                            <TabsTrigger value="login" className="w-full">Login</TabsTrigger>
                            <TabsTrigger value="register" className="w-full ">Register</TabsTrigger>
                        </TabsList>

                        <Separator orientation="horizontal" />

                        <TabsContent value="login" className="w-full">
                            <Form {...formLogIn}>
                                <form
                                    onSubmit={formLogIn.handleSubmit(onSubmitLogIn)}
                                    className="w-full flex flex-col gap-4 pt-4"
                                >
                                    <FormField
                                        control={formLogIn.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col items-start text-left w-full">
                                                <FormLabel className="self-start">Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formLogIn.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col items-start text-left w-full">
                                                <FormLabel className="self-start">Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Enter your password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <LoadingButton loading={loading} type="submit" className="hover:bg-primary hover:text-white cursor-pointer">
                                        {loading ? "Logging..." : "Login"}
                                    </LoadingButton>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="register" className="w-full">
                            <Form {...formSignUp}>
                                <form
                                    onSubmit={formSignUp.handleSubmit(onSubmitCreateAccount)}
                                    className="w-full flex flex-col gap-4 pt-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={formSignUp.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">First Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter first name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formSignUp.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter last name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={formSignUp.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter your email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formSignUp.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Enter your password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={formSignUp.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">Re-Enter Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Confirm your password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formSignUp.control}
                                            name="currency"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">Currency</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="Enter Currency" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={formSignUp.control}
                                            name="company_name"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">Company Name</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="Enter Company Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formSignUp.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">Address</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="Enter Address" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={formSignUp.control}
                                            name="tax_id"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">Tax ID</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="Enter Tax ID" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formSignUp.control}
                                            name="logo_url"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-start text-left w-full">
                                                    <FormLabel className="self-start">Logo URL</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="Enter Logo URL" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <LoadingButton loading={loading} type="submit" className="hover:bg-primary hover:text-white cursor-pointer">
                                        {loading ? "Registering..." : "Register"}
                                    </LoadingButton>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
