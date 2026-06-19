@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    Settings
@endsection

@section('content-header')
    <h1>Panel Settings<small>Configure Pterodactyl to your liking.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <form action="{{ route('admin.settings') }}" method="POST" enctype="multipart/form-data">
        {!! csrf_field() !!}

        {{-- General Settings Card --}}
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="icon-wrap" style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); color: #a5b4fc;">
                    <i class="fa fa-cog"></i>
                </div>
                <div>
                    <h3>General Settings</h3>
                    <p>Basic configuration for your panel</p>
                </div>
            </div>
            <div class="settings-card-body">
                <div class="settings-grid-3">
                    <div class="settings-field">
                        <label>Company Name</label>
                        <input type="text" class="form-control" name="app:name" value="{{ old('app:name', config('app.name')) }}" />
                        <div class="field-hint">This name is used throughout the panel and in emails sent to clients.</div>
                    </div>
                    <div class="settings-field">
                        <label>Default Language</label>
                        <select name="app:locale" class="form-control">
                            @foreach($languages as $key => $value)
                                <option value="{{ $key }}" @if(config('app.locale') === $key) selected @endif>{{ $value }}</option>
                            @endforeach
                        </select>
                        <div class="field-hint">The default language for rendering UI components.</div>
                    </div>
                    <div class="settings-field">
                        <label>Require 2-Factor Authentication</label>
                        @php
                            $level = old('pterodactyl:auth:2fa_required', config('pterodactyl.auth.2fa_required'));
                        @endphp
                        <div class="settings-toggle-group" data-toggle="buttons">
                            <label class="btn @if ($level == 0) active @endif">
                                <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="0" @if ($level == 0) checked @endif> Not Required
                            </label>
                            <label class="btn @if ($level == 1) active @endif">
                                <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="1" @if ($level == 1) checked @endif> Admin Only
                            </label>
                            <label class="btn @if ($level == 2) active @endif">
                                <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="2" @if ($level == 2) checked @endif> All Users
                            </label>
                        </div>
                        <div class="field-hint">Require specific user groups to enable 2FA.</div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Registration & Branding Card --}}
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="icon-wrap" style="background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.2)); color: #86efac;">
                    <i class="fa fa-paint-brush"></i>
                </div>
                <div>
                    <h3>Registration & Branding</h3>
                    <p>Customize appearance and user registration</p>
                </div>
            </div>
            <div class="settings-card-body">
                <div class="settings-grid-3">
                    <div class="settings-field">
                        <label>User Registration</label>
                        @php
                            $regLevel = old('app:registration', config('app.registration', '0'));
                        @endphp
                        <div class="settings-toggle-group" data-toggle="buttons">
                            <label class="btn @if ($regLevel == '0') active @endif">
                                <input type="radio" name="app:registration" autocomplete="off" value="0" @if ($regLevel == '0') checked @endif> Disabled
                            </label>
                            <label class="btn @if ($regLevel == '1') active @endif">
                                <input type="radio" name="app:registration" autocomplete="off" value="1" @if ($regLevel == '1') checked @endif> Enabled
                            </label>
                        </div>
                        <div class="field-hint">Enable or disable public user registration.</div>
                    </div>
                    <div class="settings-field">
                        <label>Custom Logo</label>
                        <div class="settings-file-upload">
                            <input type="file" name="app:logo" accept="image/*" />
                            <div class="upload-icon"><i class="fa fa-cloud-upload"></i></div>
                            <div class="upload-text">Click to upload logo</div>
                            <div class="upload-hint">PNG, JPG, SVG, WebP — Max 5 MB</div>
                        </div>
                        <div class="field-hint">Replaces the default logo on authentication pages.</div>
                    </div>
                    <div class="settings-field">
                        <label>Custom Favicon</label>
                        <div class="settings-file-upload">
                            <input type="file" name="app:favicon" accept="image/x-icon,image/png,image/jpeg,image/svg+xml,image/webp" />
                            <div class="upload-icon"><i class="fa fa-star"></i></div>
                            <div class="upload-text">Click to upload favicon</div>
                            <div class="upload-hint">ICO, PNG, JPG, SVG, WebP — Max 5 MB</div>
                        </div>
                        <div class="field-hint">Displayed in the browser tab.</div>
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
