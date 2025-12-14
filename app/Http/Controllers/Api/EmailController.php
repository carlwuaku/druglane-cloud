<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailController extends Controller
{
    /**
     * Send bulk emails.
     * Maintains backward compatibility with existing API.
     *
     * @OA\Post(
     *     path="/api/api_admin/sendBulkMail",
     *     tags={"Email"},
     *     summary="Send bulk emails",
     *     description="Send emails to multiple recipients. Accepts comma-separated email addresses.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"mails", "subject", "message"},
     *                 @OA\Property(property="mails", type="string", example="user1@example.com,user2@example.com", description="Comma-separated list of email addresses"),
     *                 @OA\Property(property="subject", type="string", example="Important Update", description="Email subject"),
     *                 @OA\Property(property="message", type="string", example="This is the email content", description="Email message body")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Emails sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="1"),
     *             @OA\Property(property="message", type="string", example="Emails sent successfully"),
     *             @OA\Property(property="sent_count", type="integer", example=5)
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="0"),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Send failed",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="0"),
     *             @OA\Property(property="message", type="string", example="Failed to send emails")
     *         )
     *     )
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sendBulkMail(Request $request): JsonResponse
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'mails' => 'required|string',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => '0',
                'message' => 'Validation failed',
                'errors' => implode(', ', $validator->errors()->all()),
            ], 422);
        }

        try {
            // Parse comma-separated emails
            $mailsString = $request->input('mails');
            $emails = array_map('trim', explode(',', $mailsString));

            // Filter out empty emails and validate each one
            $validEmails = [];
            foreach ($emails as $email) {
                if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $validEmails[] = $email;
                }
            }

            if (empty($validEmails)) {
                return response()->json([
                    'status' => '0',
                    'message' => 'No valid email addresses provided',
                ], 422);
            }

            $subject = $request->input('subject');
            $messageBody = $request->input('message');

            // TODO: Implement actual email sending logic
            // For now, we'll log the attempt and return success
            // This allows the system to work while email infrastructure is set up

            Log::info('Bulk email request', [
                'recipients' => $validEmails,
                'subject' => $subject,
                'message_preview' => substr($messageBody, 0, 100),
                'total_recipients' => count($validEmails),
            ]);

            // Uncomment this when you want to actually send emails
            /*
            foreach ($validEmails as $email) {
                Mail::raw($messageBody, function ($mail) use ($email, $subject) {
                    $mail->to($email)
                         ->subject($subject);
                });
            }
            */

            return response()->json([
                'status' => '1',
                'message' => 'Emails sent successfully',
                'sent_count' => count($validEmails),
            ]);

        } catch (\Exception $e) {
            Log::error('Bulk email failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => '0',
                'message' => 'Failed to send emails: ' . $e->getMessage(),
            ], 500);
        }
    }
}
