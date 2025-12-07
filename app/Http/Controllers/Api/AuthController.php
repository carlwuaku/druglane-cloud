<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/login",
     *     tags={"Authentication"},
     *     summary="Login user",
     *     description="Authenticate user and receive access token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="admin@druglane.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful login",
     *         @OA\JsonContent(
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="System Administrator"),
     *                 @OA\Property(property="email", type="string", example="admin@druglane.com"),
     *                 @OA\Property(property="role", type="object"),
     *                 @OA\Property(property="company", type="object", nullable=true)
     *             ),
     *             @OA\Property(property="token", type="string", example="1|xxxxxxxxxxxxxxxxxxxxxxxx"),
     *             @OA\Property(property="role", type="string", example="admin"),
     *             @OA\Property(property="company", type="object", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Invalid credentials. Please try again.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Account deactivated or license expired",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Your account has been deactivated. Please contact support.")
     *         )
     *     )
     * )
     */
    public function login(LoginRequest $request){
        $credentials = $request->validated();

        if(!Auth::attempt($credentials)){
            return response([
                "message" => "Invalid credentials. Please try again."
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // Check if user is active
        if (!$user->is_active) {
            Auth::logout();
            return response([
                "message" => "Your account has been deactivated. Please contact support."
            ], 403);
        }

        // Check if company user has active license
        if ($user->isCompanyUser() && $user->company) {
            if (!$user->company->isLicenseActive()) {
                Auth::logout();
                return response([
                    "message" => "Your company license is inactive or expired. Please contact your administrator."
                ], 403);
            }
        }

        // Update last login timestamp
        $user->updateLastLogin();

        // Load relationships
        $user->load(['role', 'company']);

        $token = $user->createToken("main")->plainTextToken;

        return response([
            'user' => $user,
            'token' => $token,
            'role' => $user->role->name,
            'company' => $user->company
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/signup",
     *     tags={"Authentication"},
     *     summary="Register new user (Currently Disabled)",
     *     description="Public registration is disabled. Users must be created by administrators.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Registration disabled",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Public registration is disabled. Please contact an administrator to create your account.")
     *         )
     *     )
     * )
     */
    public function signup(SignupRequest $request){
        $data = $request->validated();

        // For now, disable public signup - users should be created by admins
        return response([
            "message" => "Public registration is disabled. Please contact an administrator to create your account."
        ], 403);

        /* Future implementation for company user registration with invite code:
        $user = User::create([
            "role_id" => Role::where('name', Role::COMPANY_USER)->first()->id,
            "company_id" => $data["company_id"] ?? null,
            "email" => $data["email"],
            "password" => bcrypt($data["password"]),
            "name" => $data["name"],
            "is_active" => true,
        ]);

        $user->load(['role', 'company']);
        $token = $user->createToken("main")->plainTextToken;

        return response([
            'user' => $user,
            'token' => $token,
            'role' => $user->role->name,
            'company' => $user->company
        ], 201);
        */
    }

    /**
     * @OA\Get(
     *     path="/api/profile",
     *     tags={"Authentication"},
     *     summary="Get current user profile",
     *     description="Get authenticated user's profile information",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="User profile retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="System Administrator"),
     *                 @OA\Property(property="email", type="string", example="admin@druglane.com"),
     *                 @OA\Property(property="role", type="object"),
     *                 @OA\Property(property="company", type="object", nullable=true)
     *             ),
     *             @OA\Property(property="role", type="string", example="admin"),
     *             @OA\Property(property="company", type="object", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     )
     * )
     */
    public function profile(Request $request){
        /** @var User $user */
        $user = $request->user();

        // Load relationships
        $user->load(['role', 'company']);

        return response([
            'user' => $user,
            'role' => $user->role->name,
            'company' => $user->company
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     tags={"Authentication"},
     *     summary="Logout user",
     *     description="Invalidate current access token",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=204,
     *         description="Successfully logged out"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     )
     * )
     */
    public function logout(Request $request){
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('',204);
    }
}
