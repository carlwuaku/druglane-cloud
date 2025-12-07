<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:55',
            'email'=> 'sometimes|required|email|unique:users,email,'.$this->id,
            'password'=> [
                'sometimes',
                'confirmed',
                Password::min(8)->letters()->symbols(),
            ],
            'role_id' => 'sometimes|required|integer|exists:roles,id',
            'company_id' => 'nullable|integer|exists:companies,id',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
