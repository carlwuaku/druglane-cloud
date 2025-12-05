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

    public function logout(Request $request){
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('',204);
    }
}
