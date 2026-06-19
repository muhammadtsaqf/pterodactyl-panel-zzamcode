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

    <style>
        .settings-card {
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 16px;
            padding: 0;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        .settings-card-header {
            padding: 20px 28px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .settings-card-header .icon-wrap {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }
        .settings-card-header h3 {
            margin: 0;
            font-size: 17px;
            font-weight: 600;
            color: #f1f5f9;
            letter-spacing: 0.2px;
        }
        .settings-card-header p {
            margin: 2px 0 0 0;
            font-size: 13px;
            color: #64748b;
        }
        .settings-card-body {
            padding: 24px 28px;
        }
        .settings-field {
            margin-bottom: 22px;
        }
        .settings-field:last-child {
            margin-bottom: 0;
        }
        .settings-field label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #cbd5e1;
            margin-bottom: 8px;
            letter-spacing: 0.3px;
        }
        .settings-field .form-control {
            background: rgba(15, 23, 42, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 10px !important;
            color: #f1f5f9 !important;
            padding: 10px 14px !important;
            font-size: 14px !important;
            transition: all 0.2s ease !important;
            height: auto !important;
        }
        .settings-field .form-control:focus {
            border-color: #6366f1 !important;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2) !important;
            outline: none !important;
        }
        .settings-field select.form-control {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 14px center !important;
            padding-right: 36px !important;
        }
        .settings-field .field-hint {
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
            line-height: 1.5;
        }
        .settings-toggle-group {
            display: flex;
            gap: 4px;
            background: rgba(15, 23, 42, 0.5);
            border-radius: 10px;
            padding: 4px;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .settings-toggle-group .btn {
            border: none !important;
            border-radius: 8px !important;
            padding: 8px 16px !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            color: #94a3b8 !important;
            background: transparent !important;
            transition: all 0.2s ease !important;
            box-shadow: none !important;
        }
        .settings-toggle-group .btn.active {
            background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
            color: #fff !important;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
        }
        .settings-toggle-group .btn:hover:not(.active) {
            background: rgba(255, 255, 255, 0.05) !important;
            color: #cbd5e1 !important;
        }
        .settings-file-upload {
            position: relative;
            border: 2px dashed rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            background: rgba(15, 23, 42, 0.4);
        }
        .settings-file-upload:hover {
            border-color: rgba(99, 102, 241, 0.4);
            background: rgba(99, 102, 241, 0.05);
        }
        .settings-file-upload input[type="file"] {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
            width: 100%;
            height: 100%;
        }
        .settings-file-upload .upload-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(99, 102, 241, 0.15);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            color: #a5b4fc;
            font-size: 18px;
        }
        .settings-file-upload .upload-text {
            font-size: 14px;
            font-weight: 500;
            color: #cbd5e1;
        }
        .settings-file-upload .upload-hint {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
        }
        .settings-save-btn {
            background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 12px 32px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #fff !important;
            letter-spacing: 0.3px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3) !important;
        }
        .settings-save-btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4) !important;
        }
        .settings-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .settings-grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
        }
        @media (max-width: 992px) {
            .settings-grid, .settings-grid-3 {
                grid-template-columns: 1fr;
            }
        }
        .settings-footer {
            padding: 20px 28px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            display: flex;
            justify-content: flex-end;
            align-items: center;
        }
    </style>

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
