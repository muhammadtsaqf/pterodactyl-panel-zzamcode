<?php

namespace Pterodactyl\Http\Requests\Admin\Settings;

use Illuminate\Validation\Rule;
use Pterodactyl\Traits\Helpers\AvailableLanguages;
use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class BaseSettingsFormRequest extends AdminFormRequest
{
    use AvailableLanguages;

    public function rules(): array
    {
        return [
            'app:name' => 'required|string|max:191',
            'app:registration' => 'required|in:0,1',
            'app:logo' => 'nullable|file|mimes:png,jpg,jpeg,svg,gif,webp|max:2048',
            'app:favicon' => 'nullable|file|mimes:ico,png,jpg,jpeg,svg,gif,webp|max:1024',
            'pterodactyl:auth:2fa_required' => 'required|integer|in:0,1,2',
            'app:locale' => ['required', 'string', Rule::in(array_keys($this->getAvailableLanguages()))],
        ];
    }

    public function attributes(): array
    {
        return [
            'app:name' => 'Company Name',
            'app:registration' => 'Enable Registration',
            'app:logo' => 'Custom Logo',
            'app:favicon' => 'Custom Favicon',
            'pterodactyl:auth:2fa_required' => 'Require 2-Factor Authentication',
            'app:locale' => 'Default Language',
        ];
    }
}
