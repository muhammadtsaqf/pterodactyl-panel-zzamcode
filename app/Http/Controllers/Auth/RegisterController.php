<?php

namespace Pterodactyl\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Pterodactyl\Services\Users\UserCreationService;
use Illuminate\Validation\ValidationException;

class RegisterController extends AbstractLoginController
{
    private UserCreationService $creationService;

    public function __construct(UserCreationService $creationService)
    {
        parent::__construct();
        $this->creationService = $creationService;
    }

    /**
     * Handle incoming request for register route and render base view.
     */
    public function index(): View
    {
        return view('templates/auth.core');
    }

    /**
     * Handle a register request to the application.
     *
     * @throws ValidationException
     */
    public function register(Request $request): JsonResponse
    {
        $this->validate($request, [
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|alpha_dash|between:1,255|unique:users,username',
            'name_first' => 'required|string|between:1,255',
            'name_last' => 'required|string|between:1,255',
            'password' => 'required|string|min:8',
        ]);

        try {
            $user = $this->creationService->handle([
                'email' => $request->input('email'),
                'username' => $request->input('username'),
                'name_first' => $request->input('name_first'),
                'name_last' => $request->input('name_last'),
                'password' => $request->input('password'),
                'root_admin' => false,
            ]);

            // Auto-login using the method from AbstractLoginController
            return $this->sendLoginResponse($user, $request);
        } catch (\Exception $ex) {
            throw ValidationException::withMessages([
                'username' => ['Gagal mendaftar. Silakan hubungi administrator: ' . $ex->getMessage()],
            ]);
        }
    }
}
