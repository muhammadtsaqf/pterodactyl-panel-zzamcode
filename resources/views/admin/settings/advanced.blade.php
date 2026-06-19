@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'advanced'])

@section('title')
    Advanced Settings
@endsection

@section('content-header')
    <h1>Advanced Settings<small>Configure advanced settings for Pterodactyl.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <form action="" method="POST">
        {!! csrf_field() !!}

        {{-- reCAPTCHA Card --}}
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="icon-wrap" style="background: linear-gradient(135deg, rgba(234,179,8,0.2), rgba(202,138,4,0.2)); color: #fde047;">
                    <i class="fa fa-shield"></i>
                </div>
                <div>
                    <h3>reCAPTCHA</h3>
                    <p>Protect login and password reset forms with Google reCAPTCHA</p>
                </div>
            </div>
            <div class="settings-card-body">
                <div class="settings-grid-3">
                    <div class="settings-field">
                        <label>Status</label>
                        <select class="form-control" name="recaptcha:enabled">
                            <option value="true">Enabled</option>
                            <option value="false" @if(old('recaptcha:enabled', config('recaptcha.enabled')) == '0') selected @endif>Disabled</option>
                        </select>
                        <div class="field-hint">Silent captcha check on login and password reset forms.</div>
                    </div>
                    <div class="settings-field">
                        <label>Site Key</label>
                        <input type="text" required class="form-control" name="recaptcha:website_key" value="{{ old('recaptcha:website_key', config('recaptcha.website_key')) }}">
                        <div class="field-hint">Your reCAPTCHA site key.</div>
                    </div>
                    <div class="settings-field">
                        <label>Secret Key</label>
                        <input type="text" required class="form-control" name="recaptcha:secret_key" value="{{ old('recaptcha:secret_key', config('recaptcha.secret_key')) }}">
                        <div class="field-hint">Keep this secret. Used for server-side verification.</div>
                    </div>
                </div>
                @if($showRecaptchaWarning)
                    <div style="margin-top: 16px; padding: 14px 18px; background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.2); border-radius: 10px; color: #fde047; font-size: 13px;">
                        <i class="fa fa-exclamation-triangle" style="margin-right: 8px;"></i>
                        You are currently using default reCAPTCHA keys. For improved security, <a href="https://www.google.com/recaptcha/admin" style="color: #a5b4fc; text-decoration: underline;">generate new invisible reCAPTCHA keys</a> for your website.
                    </div>
                @endif
            </div>
        </div>

        {{-- HTTP Connections Card --}}
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="icon-wrap" style="background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2)); color: #93c5fd;">
                    <i class="fa fa-globe"></i>
                </div>
                <div>
                    <h3>HTTP Connections</h3>
                    <p>Configure connection and request timeout settings</p>
                </div>
            </div>
            <div class="settings-card-body">
                <div class="settings-grid">
                    <div class="settings-field">
                        <label>Connection Timeout (seconds)</label>
                        <input type="number" required class="form-control" name="pterodactyl:guzzle:connect_timeout" value="{{ old('pterodactyl:guzzle:connect_timeout', config('pterodactyl.guzzle.connect_timeout')) }}">
                        <div class="field-hint">Time to wait for a connection to be opened.</div>
                    </div>
                    <div class="settings-field">
                        <label>Request Timeout (seconds)</label>
                        <input type="number" required class="form-control" name="pterodactyl:guzzle:timeout" value="{{ old('pterodactyl:guzzle:timeout', config('pterodactyl.guzzle.timeout')) }}">
                        <div class="field-hint">Time to wait for a request to complete.</div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Automatic Allocation Card --}}
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="icon-wrap" style="background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.2)); color: #c4b5fd;">
                    <i class="fa fa-random"></i>
                </div>
                <div>
                    <h3>Automatic Allocation Creation</h3>
                    <p>Allow users to create allocations from the frontend</p>
                </div>
            </div>
            <div class="settings-card-body">
                <div class="settings-grid-3">
                    <div class="settings-field">
                        <label>Status</label>
                        <select class="form-control" name="pterodactyl:client_features:allocations:enabled">
                            <option value="false">Disabled</option>
                            <option value="true" @if(old('pterodactyl:client_features:allocations:enabled', config('pterodactyl.client_features.allocations.enabled'))) selected @endif>Enabled</option>
                        </select>
                        <div class="field-hint">Enable automatic allocation creation for users.</div>
                    </div>
                    <div class="settings-field">
                        <label>Starting Port</label>
                        <input type="number" class="form-control" name="pterodactyl:client_features:allocations:range_start" value="{{ old('pterodactyl:client_features:allocations:range_start', config('pterodactyl.client_features.allocations.range_start')) }}">
                        <div class="field-hint">Beginning of the auto-allocation port range.</div>
                    </div>
                    <div class="settings-field">
                        <label>Ending Port</label>
                        <input type="number" class="form-control" name="pterodactyl:client_features:allocations:range_end" value="{{ old('pterodactyl:client_features:allocations:range_end', config('pterodactyl.client_features.allocations.range_end')) }}">
                        <div class="field-hint">End of the auto-allocation port range.</div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Save Button --}}
        <div style="display: flex; justify-content: flex-end; padding-bottom: 20px;">
            <button type="submit" name="_method" value="PATCH" class="settings-save-btn">
                <i class="fa fa-check" style="margin-right: 8px;"></i> Save Changes
            </button>
        </div>
    </form>
@endsection
